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
    bucket = "tf-services-app"
    key    = "terraform/state/terraform.tfstate"
    region = "us-east-1"
  }
}

data "aws_iam_role" "iam_role" {
  name = "LabRole"
}

locals {
  feedback_lambda_path = "${path.root}/../../services/feedbacks/lambda"
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


# --- Feedbacks/Reviews Service ---
# Create lambda function layer
resource "aws_lambda_layer_version" "feedbacks_lambda_layer" {
  layer_name  = "feedbacks-lambda-layer"
  description = "Mongodb node_modules layer"

  compatible_runtimes = ["nodejs18.x"]
  filename            = "${local.feedback_lambda_path}/feedback_layer.zip"
  source_code_hash    = filebase64sha256("${local.feedback_lambda_path}/feedback_layer.zip")
}

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
  output_path = "${path.module}/build/feedback_queue_processor_zip"
  layers      = [aws_lambda_layer_version.feedbacks_lambda_layer.arn]

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


# Create random string for feedbacks suffix
resource "random_string" "hash" {
  length  = 5
  special = false
  upper   = false
}

# Create Elastic Beanstalk for Feedbacks service
module "aws-elasticbeanstalk" {
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
  value      = module.aws-elasticbeanstalk.eb_application_name
  depends_on = [module.aws-elasticbeanstalk]
}

# write FEEDBACKS_EB_ENVIRONMENT_NAME to secrets
resource "doppler_secret" "FEEDBACKS_EB_ENVIRONMENT_NAME" {
  name       = "FEEDBACKS_EB_ENVIRONMENT_NAME"
  project    = var.project_name
  config     = terraform.workspace
  value      = module.aws-elasticbeanstalk.eb_environment_name
  depends_on = [module.aws-elasticbeanstalk]
}
