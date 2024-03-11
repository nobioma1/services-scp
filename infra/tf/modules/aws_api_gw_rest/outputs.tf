output "api_gateway_id" {
  description = "API Gateway id"
  value       = aws_api_gateway_rest_api.api_gw_rest.id
}

output "api_gateway_root_resource_id" {
  description = "API gateway root resource id"
  value       = aws_api_gateway_rest_api.api_gw_rest.root_resource_id
}

output "api_gateway_execution_arn" {
  description = "API gateway execution ARN"
  value       = aws_api_gateway_rest_api.api_gw_rest.execution_arn
}