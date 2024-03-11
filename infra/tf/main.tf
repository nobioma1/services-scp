terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }

    doppler = {
      source = "DopplerHQ/doppler"
    }
  }

  # backend "s3" {
  #   bucket = "tf-services-app"
  #   key    = "terraform/state/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

locals {
  services_layer_path  = "${path.root}/../../packages/lambda-layer"
  feedback_lambda_path = "${path.root}/../../services/feedbacks/lambda"
  events_lambda_path   = "${path.root}/../../services/events"
  tickets_lambda_path  = "${path.root}/../../services/tickets"
}

# Get LabRole (Learner Lab)
data "aws_iam_role" "iam_role" {
  name = "LabRole"
}

# load secrets
module "secrets" {
  source = "./modules/secrets"
}


# create bucket for build artifacts
resource "aws_s3_bucket" "build_artifacts_bucket" {
  bucket_prefix = "scp-services-build-artifacts-"
  force_destroy = true
}

# write build artifacts bucket name to secrets
resource "doppler_secret" "BUILD_ARTIFACTS_BUCKET_NAME" {
  name       = "BUILD_ARTIFACTS_BUCKET_NAME"
  project    = var.project_name
  config     = terraform.workspace
  value      = aws_s3_bucket.build_artifacts_bucket.bucket
  depends_on = [aws_s3_bucket.build_artifacts_bucket]
}

# Create random strings for suffix to prevent conflict 
resource "random_string" "hash" {
  length  = 5
  special = false
  upper   = false
}

# --- FRONTEND ---
# --- Static Website ---
module "s3_static_website" {
  source = "./modules/s3-static-website"

  bucket_name   = "open-events-${random_string.hash.result}"
  bucket_region = var.aws_default_region
}

# write FRONTEND_BUCKET_NAME to secrets
resource "doppler_secret" "FRONTEND_BUCKET_NAME" {
  name       = "FRONTEND_BUCKET_NAME"
  project    = var.project_name
  config     = terraform.workspace
  value      = "open-events-${random_string.hash.result}"
  depends_on = [module.s3_static_website]
}

# --- SERVICES ---
# Create services lambda function layer
resource "aws_lambda_layer_version" "services_lambda_layer" {
  layer_name  = "services-lambda-layer"
  description = "Node_modules for services"

  compatible_runtimes = ["nodejs18.x"]
  filename            = "${local.services_layer_path}/services_lambda_layer.zip"
  source_code_hash    = filebase64sha256("${local.services_layer_path}/services_lambda_layer.zip")
}

# --- Events Service ---
# GET | POST - events lambda function
module "get_post_events_lambda" {
  source = "./modules/aws_lambda"

  function_name = "EventsAPIControllerFunction"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role_arn      = data.aws_iam_role.iam_role.arn

  source_dir  = "${local.events_lambda_path}/EventsAPIControllerFunction"
  output_path = "${path.module}/build/events_api_controller.zip"
  layers      = [aws_lambda_layer_version.services_lambda_layer.arn]
  environment_variables = {
    MONGO_URI = "${module.secrets.events_db_uri}"
  }
}

# Create API Gateway for Events Service
module "api_gw_events" {
  source = "./modules/aws_api_gw_rest"

  api_gateway_name        = "events-api"
  api_gateway_description = "API Service events service"
}

# Create model for create event
resource "aws_api_gateway_model" "create_event_model" {
  rest_api_id  = module.api_gw_events.api_gateway_id
  name         = "CreateEventModel"
  description  = "Model for create event request body"
  content_type = "application/json"

  schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#"
    "title"   = "CreateEventDto"
    "type"    = "object"
    "properties" = {
      "name" = {
        "type"      = "string"
        "maxLength" = 250
        "minLength" = 1
      }
      "description" = {
        "type"      = "string"
        "maxLength" = 500
      }
      "date" = {
        "type"   = "string"
        "format" = "date-time"
      }
      "location" = {
        "type" = "object"
        "properties" = {
          "address" = { "type" = "string" }
        }
        "required" = ["address"]
      }
      "hostName" = {
        "type"      = "string"
        "minLength" = 1
      }
    }
    "required" = ["name", "hostName", "location"]
  })
}

# Create event body validator
resource "aws_api_gateway_request_validator" "create_event_validator" {
  name                        = "event-body-validator"
  rest_api_id                 = module.api_gw_events.api_gateway_id
  validate_request_body       = true
  validate_request_parameters = false
}


# /events - Create api gateway events resource
resource "aws_api_gateway_resource" "events_resource" {
  rest_api_id = module.api_gw_events.api_gateway_id
  parent_id   = module.api_gw_events.api_gateway_root_resource_id
  path_part   = "events"
}

# /events/{eventId} - Create api gateway eventId resource
resource "aws_api_gateway_resource" "event_id_resource" {
  rest_api_id = module.api_gw_events.api_gateway_id
  parent_id   = aws_api_gateway_resource.events_resource.id
  path_part   = "{eventId}"
}

# GET | POST - events lambda function execution permission
resource "aws_lambda_permission" "get_post_events_lambda_api_gw_permission" {
  statement_id = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"

  function_name = module.get_post_events_lambda.lambda_function_name
  source_arn    = "${module.api_gw_events.api_gateway_execution_arn}/*/*"
}

# GET /events resource method
resource "aws_api_gateway_method" "get_events_method" {
  rest_api_id = module.api_gw_events.api_gateway_id
  resource_id = aws_api_gateway_resource.events_resource.id

  authorization = "NONE"
  http_method   = "GET"
}

# GET /events/{eventId} resource method
resource "aws_api_gateway_method" "get_event_id_method" {
  rest_api_id = module.api_gw_events.api_gateway_id
  resource_id = aws_api_gateway_resource.event_id_resource.id

  authorization = "NONE"
  http_method   = "GET"
}

# POST /events resource method
resource "aws_api_gateway_method" "post_events_method" {
  rest_api_id = module.api_gw_events.api_gateway_id
  resource_id = aws_api_gateway_resource.events_resource.id

  authorization        = "NONE"
  http_method          = "POST"
  request_validator_id = aws_api_gateway_request_validator.create_event_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.create_event_model.name
  }
}

# GET /events - lambda function, resource, method integration
resource "aws_api_gateway_integration" "get_events_integration" {
  rest_api_id             = module.api_gw_events.api_gateway_id
  resource_id             = aws_api_gateway_resource.events_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.get_events_method.http_method
  uri         = module.get_post_events_lambda.lambda_function_invoke_arn
}

# GET /events/{eventsId} - lambda function, resource, method integration
resource "aws_api_gateway_integration" "get_event_id_integration" {
  rest_api_id             = module.api_gw_events.api_gateway_id
  resource_id             = aws_api_gateway_resource.event_id_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.get_event_id_method.http_method
  uri         = module.get_post_events_lambda.lambda_function_invoke_arn
}

# POST /events - lambda function, resource, method integration
resource "aws_api_gateway_integration" "post_events_integration" {
  rest_api_id             = module.api_gw_events.api_gateway_id
  resource_id             = aws_api_gateway_resource.events_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.post_events_method.http_method
  uri         = module.get_post_events_lambda.lambda_function_invoke_arn
}

# api gateway deployment 
resource "aws_api_gateway_deployment" "api_gw_events_deployment" {
  rest_api_id = module.api_gw_events.api_gateway_id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.events_resource.id,
      aws_api_gateway_method.get_events_method.id,
      aws_api_gateway_integration.get_events_integration.id,
      aws_api_gateway_method.post_events_method.id,
      aws_api_gateway_integration.post_events_integration.id,
      aws_api_gateway_method.get_event_id_method.id,
      aws_api_gateway_integration.get_event_id_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# api gateway deployment stage 
resource "aws_api_gateway_stage" "api_gw_events_stage" {
  deployment_id = aws_api_gateway_deployment.api_gw_events_deployment.id
  rest_api_id   = module.api_gw_events.api_gateway_id
  stage_name    = terraform.workspace

  variables = {
    version = "v1"
  }
}

# write EVENTS_DOMAIN to secrets
resource "doppler_secret" "EVENTS_DOMAIN" {
  name       = "VITE_EVENTS_SERVICE_DOMAIN"
  project    = var.project_name
  config     = terraform.workspace
  value      = aws_api_gateway_stage.api_gw_events_stage.invoke_url
  depends_on = [aws_api_gateway_stage.api_gw_events_stage]
}

# --- Tickets Service ---
# GET | POST - tickets lambda function
module "get_post_tickets_lambda" {
  source = "./modules/aws_lambda"

  function_name = "TicketsAPIControllerFunction"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role_arn      = data.aws_iam_role.iam_role.arn

  source_dir  = "${local.tickets_lambda_path}/TicketsAPIControllerFunction"
  output_path = "${path.module}/build/tickets_api_controller.zip"
  layers      = [aws_lambda_layer_version.services_lambda_layer.arn]
  environment_variables = {
    MONGO_URI = "${module.secrets.tickets_db_uri}"
  }
}

# Create API Gateway for Tickects Service
module "api_gw_tickets" {
  source = "./modules/aws_api_gw_rest"

  api_gateway_name        = "tickets-api"
  api_gateway_description = "API Service tickets service"
}

# Create model for create ticket
resource "aws_api_gateway_model" "create_ticket_model" {
  rest_api_id  = module.api_gw_tickets.api_gateway_id
  name         = "CreateEventModel"
  description  = "Model for create ticket request body"
  content_type = "application/json"

  schema = jsonencode({
    "$schema" = "http://json-schema.org/draft-04/schema#"
    "title"   = "CreateTicketDto"
    "type"    = "object"
    "properties" = {
      "name" = {
        "type"      = "string"
        "maxLength" = 250
        "minLength" = 1
      }
      "eventId" = {
        "type" = "string"
      }
    }
    "required" = ["name", "eventId"]
  })
}

# Create event body validator
resource "aws_api_gateway_request_validator" "create_ticket_validator" {
  name                        = "ticket-body-validator"
  rest_api_id                 = module.api_gw_tickets.api_gateway_id
  validate_request_body       = true
  validate_request_parameters = false
}

# /tickets - Create api gateway tickets resource
resource "aws_api_gateway_resource" "tickets_resource" {
  rest_api_id = module.api_gw_tickets.api_gateway_id
  parent_id   = module.api_gw_tickets.api_gateway_root_resource_id
  path_part   = "tickets"
}

# /tickets/{ticketId} - Create api gateway ticketId resource
resource "aws_api_gateway_resource" "ticket_id_resource" {
  rest_api_id = module.api_gw_tickets.api_gateway_id
  parent_id   = aws_api_gateway_resource.tickets_resource.id
  path_part   = "{ticketId}"
}

# GET | POST - tickets lambda function execution permission
resource "aws_lambda_permission" "get_post_tickets_lambda_api_gw_permission" {
  statement_id = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"

  function_name = module.get_post_tickets_lambda.lambda_function_name
  source_arn    = "${module.api_gw_tickets.api_gateway_execution_arn}/*/*"
}

# GET /tickets resource methods
resource "aws_api_gateway_method" "get_tickets_method" {
  rest_api_id = module.api_gw_tickets.api_gateway_id
  resource_id = aws_api_gateway_resource.tickets_resource.id

  authorization = "NONE"
  http_method   = "GET"
}

# GET /tickets/{ticketId} resource methods
resource "aws_api_gateway_method" "get_ticket_id_method" {
  rest_api_id = module.api_gw_tickets.api_gateway_id
  resource_id = aws_api_gateway_resource.ticket_id_resource.id

  authorization = "NONE"
  http_method   = "GET"
}

# POST /tickets resource methods
resource "aws_api_gateway_method" "post_tickets_method" {
  rest_api_id = module.api_gw_tickets.api_gateway_id
  resource_id = aws_api_gateway_resource.tickets_resource.id

  authorization        = "NONE"
  http_method          = "POST"
  request_validator_id = aws_api_gateway_request_validator.create_ticket_validator.id

  request_models = {
    "application/json" = aws_api_gateway_model.create_ticket_model.name
  }
}

# GET /tickets - lambda function, resource, method integration
resource "aws_api_gateway_integration" "get_tickets_integration" {
  rest_api_id             = module.api_gw_tickets.api_gateway_id
  resource_id             = aws_api_gateway_resource.tickets_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.get_tickets_method.http_method
  uri         = module.get_post_tickets_lambda.lambda_function_invoke_arn
}

# GET /tickets/{ticketId} - lambda function, resource, method integration
resource "aws_api_gateway_integration" "get_ticket_id_integration" {
  rest_api_id             = module.api_gw_tickets.api_gateway_id
  resource_id             = aws_api_gateway_resource.ticket_id_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.get_ticket_id_method.http_method
  uri         = module.get_post_tickets_lambda.lambda_function_invoke_arn
}

# POST /tickets - lambda function, resource, method integration
resource "aws_api_gateway_integration" "post_tickets_integration" {
  rest_api_id             = module.api_gw_tickets.api_gateway_id
  resource_id             = aws_api_gateway_resource.tickets_resource.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"

  http_method = aws_api_gateway_method.post_tickets_method.http_method
  uri         = module.get_post_tickets_lambda.lambda_function_invoke_arn
}

# api gateway deployment 
resource "aws_api_gateway_deployment" "api_gw_tickets_deployment" {
  rest_api_id = module.api_gw_tickets.api_gateway_id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.tickets_resource.id,
      aws_api_gateway_method.get_tickets_method.id,
      aws_api_gateway_integration.get_tickets_integration.id,
      aws_api_gateway_method.post_tickets_method.id,
      aws_api_gateway_integration.post_tickets_integration.id,
      aws_api_gateway_method.get_ticket_id_method.id,
      aws_api_gateway_integration.get_ticket_id_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# api gateway deployment stage 
resource "aws_api_gateway_stage" "api_gw_tickets_stage" {
  deployment_id = aws_api_gateway_deployment.api_gw_tickets_deployment.id
  rest_api_id   = module.api_gw_tickets.api_gateway_id
  stage_name    = terraform.workspace

  variables = {
    version = "v1"
  }
}

# write TICKETS_DOMAIN to secrets
resource "doppler_secret" "TICKETS_DOMAIN" {
  name       = "VITE_TICKETS_SERVICE_DOMAIN"
  project    = var.project_name
  config     = terraform.workspace
  value      = aws_api_gateway_stage.api_gw_tickets_stage.invoke_url
  depends_on = [aws_api_gateway_stage.api_gw_tickets_stage]
}

# --- Feedbacks/Reviews Service ---
# Create queue
resource "aws_sqs_queue" "feedback_ratings_queue" {
  name = "feedbackRatingsQueue"
}

# Create lambda function for feedback queue processor
module "feedback_queue_processor_lambda" {
  source = "./modules/aws_lambda"

  function_name = "FeedbackQueueProcessor"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role_arn      = data.aws_iam_role.iam_role.arn

  source_dir  = "${local.feedback_lambda_path}/FeedbackQueueProcessor"
  output_path = "${path.module}/build/feedback_queue_processor.zip"
  layers      = [aws_lambda_layer_version.services_lambda_layer.arn]

  environment_variables = {
    QUEUE_URL   = "${aws_sqs_queue.feedback_ratings_queue.url}"
    MONGODB_URL = module.secrets.feedbacks_db_uri
    DB_NAME     = "feedbacks"
  }
}

# Create Permission for lambda function invocation
resource "aws_lambda_permission" "allow_sqs_to_invoke_lambda" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.feedback_ratings_queue.arn
  function_name = module.feedback_queue_processor_lambda.lambda_function_name
}

# connect trigger feedback lambda function and sqs queue
resource "aws_lambda_event_source_mapping" "sqs_lambda_trigger" {
  event_source_arn = aws_sqs_queue.feedback_ratings_queue.arn
  function_name    = module.feedback_queue_processor_lambda.lambda_function_name
  enabled          = true
}


# Create Elastic Beanstalk for Feedbacks service
module "aws-feedbacks-elasticbeanstalk" {
  source = "./modules/aws-eb"

  eb_application_name        = "feedbacks-ratings-app-${terraform.workspace}-${random_string.hash.result}"
  eb_env_name                = lower("getfeedbacksapp-${random_string.hash.result}")
  eb_env_instance_profile    = "LabInstanceProfile"
  eb_environment_type        = "LoadBalanced"
  eb_env_solution_stack_name = "64bit Amazon Linux 2023 v6.1.1 running Node.js 20"
  environment_variables = [
    { name = "AWS_REGION", value = "${var.aws_default_region}" },
    { name = "MONGO_URI", value = "${module.secrets.feedbacks_db_uri}" },
    { name = "SQS_QUEUE_URL", value = "${aws_sqs_queue.feedback_ratings_queue.url}" },
  ]
}

# write FEEDBACKS_EB_APPLICATION_NAME to secrets
resource "doppler_secret" "FEEDBACKS_EB_APPLICATION_NAME" {
  name       = "FEEDBACKS_EB_APPLICATION_NAME"
  project    = var.project_name
  config     = terraform.workspace
  value      = module.aws-feedbacks-elasticbeanstalk.eb_application_name
  depends_on = [module.aws-feedbacks-elasticbeanstalk]
}

# write FEEDBACKS_EB_ENVIRONMENT_NAME to secrets
resource "doppler_secret" "FEEDBACKS_EB_ENVIRONMENT_NAME" {
  name       = "FEEDBACKS_EB_ENVIRONMENT_NAME"
  project    = var.project_name
  config     = terraform.workspace
  value      = module.aws-feedbacks-elasticbeanstalk.eb_environment_name
  depends_on = [module.aws-feedbacks-elasticbeanstalk]
}

# write FEEDBACKS_DOMAIN to secrets
resource "doppler_secret" "FEEDBACKS_DOMAIN" {
  name       = "VITE_FEEDBACKS_SERVICE_DOMAIN"
  project    = var.project_name
  config     = terraform.workspace
  value      = module.aws-feedbacks-elasticbeanstalk.eb_environment_domain
  depends_on = [module.aws-feedbacks-elasticbeanstalk]
}
