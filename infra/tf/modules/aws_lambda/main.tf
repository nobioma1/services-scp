data "archive_file" "lambda_source_code_zip" {
  type = "zip"
  source_dir  = var.source_dir
  output_path = var.output_path
}

resource "aws_lambda_function" "lambda_function" {
  function_name    = var.function_name
  handler          = var.handler
  runtime          = var.runtime
  role             = var.role_arn
  filename         = var.output_path
  source_code_hash = data.archive_file.lambda_source_code_zip.output_base64sha256
  layers           = var.layers

  environment {
    variables = var.environment_variables
  }
}