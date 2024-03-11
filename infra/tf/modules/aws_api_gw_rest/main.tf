resource "aws_api_gateway_rest_api" "api_gw_rest" {
  name        = var.api_gateway_name
  description = var.api_gateway_description

  endpoint_configuration {
    types = var.api_gateway_endpoint_types
  }
}