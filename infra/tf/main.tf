terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }

    doppler = {
      source = "DopplerHQ/doppler"
    }
  }

  backend "s3" {
    bucket = "tf-state-services-app"
    key    = "terraform/state/terraform.tfstate"
    region = "us-east-1"
  }
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

# ----------------------------- FRONTEND --------------------------------------
# create s3 bucket for static hosting
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

# ----------------------------- SERVICES --------------------------------------
# Create services lambda function layer
resource "aws_lambda_layer_version" "services_lambda_layer" {
  layer_name  = "services-lambda-layer"
  description = "Node_modules for services"

  compatible_runtimes = ["nodejs18.x"]
  filename            = "${path.root}/../../packages/lambda-layer/services_lambda_layer.zip"
  source_code_hash    = filebase64sha256("${path.root}/../../packages/lambda-layer/services_lambda_layer.zip")
}

# # ---------------------------- EVENTS SERVICE -------------------------------
# create events SNS Topic
resource "aws_sns_topic" "events_sns_topic" {
  name = "events"
}

# GET | POST - events lambda function
module "get_post_events_lambda" {
  source = "./modules/aws_lambda"

  function_name = "EventsAPIControllerFunction"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role_arn      = data.aws_iam_role.iam_role.arn

  source_dir  = "${path.root}/../../services/events/EventsAPIControllerFunction"
  output_path = "${path.module}/build/events_api_controller.zip"
  layers      = [aws_lambda_layer_version.services_lambda_layer.arn]

  environment_variables = {
    MONGO_URI = "${module.secrets.events_db_uri}"
  }
}

# create api gateway for events service
resource "aws_apigatewayv2_api" "events_api_gw" {
  name          = "events-api-gw"
  description   = "API service events service"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

# events api gateway stage 
resource "aws_apigatewayv2_stage" "events_stage" {
  api_id = aws_apigatewayv2_api.events_api_gw.id

  name        = terraform.workspace
  auto_deploy = true
}

# events api gateway lambda integration 
resource "aws_apigatewayv2_integration" "get_post_events_integration" {
  api_id = aws_apigatewayv2_api.events_api_gw.id

  integration_uri    = module.get_post_events_lambda.lambda_function_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# GET /events api gateway route 
resource "aws_apigatewayv2_route" "get_events_route" {
  api_id = aws_apigatewayv2_api.events_api_gw.id

  route_key = "GET /events"
  target    = "integrations/${aws_apigatewayv2_integration.get_post_events_integration.id}"
}

# POST /events api gateway route 
resource "aws_apigatewayv2_route" "post_events_route" {
  api_id = aws_apigatewayv2_api.events_api_gw.id

  route_key = "POST /events"
  target    = "integrations/${aws_apigatewayv2_integration.get_post_events_integration.id}"
}

# GET /events/{eventId} api gateway route 
resource "aws_apigatewayv2_route" "get_event_route" {
  api_id = aws_apigatewayv2_api.events_api_gw.id

  route_key = "GET /events/{eventId}"
  target    = "integrations/${aws_apigatewayv2_integration.get_post_events_integration.id}"
}

# api gateway get_post_events_lambda invocation permission 
resource "aws_lambda_permission" "events_api_gw_lambda_permission" {
  statement_id = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"

  function_name = module.get_post_events_lambda.lambda_function_name
  source_arn    = "${aws_apigatewayv2_api.events_api_gw.execution_arn}/*/*"
}

# write EVENTS_DOMAIN to secrets
resource "doppler_secret" "EVENTS_DOMAIN" {
  name    = "VITE_EVENTS_SERVICE_DOMAIN"
  project = var.project_name
  config  = terraform.workspace
  value   = aws_apigatewayv2_stage.events_stage.invoke_url
}


# ----------------------------- TICKETS SERVICE -------------------------------
# GET | POST - tickets lambda function
module "get_post_tickets_lambda" {
  source = "./modules/aws_lambda"

  function_name = "TicketsAPIControllerFunction"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role_arn      = data.aws_iam_role.iam_role.arn

  source_dir  = "${path.root}/../../services/tickets/TicketsAPIControllerFunction"
  output_path = "${path.module}/build/tickets_api_controller.zip"
  layers      = [aws_lambda_layer_version.services_lambda_layer.arn]

  environment_variables = {
    MONGO_URI = "${module.secrets.tickets_db_uri}"
  }
}

# create api gateway for tickets service
resource "aws_apigatewayv2_api" "tickets_api_gw" {
  name          = "tickets-api-gw"
  description   = "API service tickets service"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

# tickets api gateway stage 
resource "aws_apigatewayv2_stage" "tickets_stage" {
  api_id = aws_apigatewayv2_api.tickets_api_gw.id

  name        = terraform.workspace
  auto_deploy = true
}

# tickets api gateway lambda integration 
resource "aws_apigatewayv2_integration" "get_post_tickets_integration" {
  api_id = aws_apigatewayv2_api.tickets_api_gw.id

  integration_uri    = module.get_post_tickets_lambda.lambda_function_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# POST /tickets api gateway route 
resource "aws_apigatewayv2_route" "post_ticket_route" {
  api_id = aws_apigatewayv2_api.tickets_api_gw.id

  route_key = "POST /tickets"
  target    = "integrations/${aws_apigatewayv2_integration.get_post_tickets_integration.id}"
}

# GET /tickets/{ticketId} api gateway route 
resource "aws_apigatewayv2_route" "get_ticket_route" {
  api_id = aws_apigatewayv2_api.tickets_api_gw.id

  route_key = "GET /tickets/{ticketId}"
  target    = "integrations/${aws_apigatewayv2_integration.get_post_tickets_integration.id}"
}

# api gateway get_post_tickets_lambda invocation permission 
resource "aws_lambda_permission" "tickets_api_gw_lambda_permission" {
  statement_id = "AllowExecutionFromAPIGateway"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"

  function_name = module.get_post_tickets_lambda.lambda_function_name
  source_arn    = "${aws_apigatewayv2_api.tickets_api_gw.execution_arn}/*/*"
}

# write TICKETS_DOMAIN to secrets
resource "doppler_secret" "TICKETS_DOMAIN" {
  name    = "VITE_TICKETS_SERVICE_DOMAIN"
  project = var.project_name
  config  = terraform.workspace
  value   = aws_apigatewayv2_stage.tickets_stage.invoke_url
}

# -------------------------- FEEDBACK/REVIEWS SERVICE --------------------------
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

  source_dir  = "${path.root}/../../services/feedbacks/lambda/FeedbackQueueProcessor"
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
