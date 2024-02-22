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

module "secrets" {
  source = "./modules/secrets"
}

resource "aws_lambda_layer_version" "feedbacks_lambda_layer" {
  layer_name  = "feedbacks-lambda-layer"
  description = "Mongodb node_modules layer"

  compatible_runtimes = ["nodejs18.x"]
  filename            = "${local.feedback_lambda_path}/feedback_layer.zip"
  source_code_hash    = filebase64sha256("${local.feedback_lambda_path}/feedback_layer.zip")
}

resource "aws_sqs_queue" "feedback_ratings_queue" {
  name                        = "feedbackRatingsQueue.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
}

module "feedback_queue_processor_lambda" {
  source = "./modules/aws_lambda"

  function_name = "FeedbackQueueProcessor"
  handler       = "FeedbackQueueProcessor.index"
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

resource "aws_lambda_permission" "allow_sqs_to_invoke_lambda" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.feedback_ratings_queue.arn
  function_name = module.feedback_queue_processor_lambda.lambda_function_name
}

resource "random_string" "hash" {
  length  = 5
  special = false
  upper   = false
}

module "aws-elasticbeanstalk" {
  source = "./modules/aws-eb"

  eb_application_name     = "feedbacks-ratings-app-${terraform.workspace}-${random_string.hash.result}"
  eb_env_name             = lower("getfeedbacksapp-${random_string.hash.result}")
  eb_env_instance_profile = "LabInstanceProfile"
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
  value      = module.aws-elasticbeanstalk.eb_environment_name
  depends_on = [module.aws-elasticbeanstalk]
}
