output "lambda_function_name" {
  description = "Name of Lambda function"
  value       = aws_lambda_function.lambda_function.function_name
}

output "lambda_function_invoke_arn" {
  description = "Lambda function invoke ARN value"
  value       = aws_lambda_function.lambda_function.invoke_arn
}
