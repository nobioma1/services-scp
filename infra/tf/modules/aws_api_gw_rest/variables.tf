variable "api_gateway_name" {
  type        = string
  description = "Name of API Gateway"
}

variable "api_gateway_description" {
  type        = string
  default     = ""
  description = "Description for API Gateway"
}

variable "api_gateway_endpoint_types" {
  type        = list(string)
  default     = ["REGIONAL"]
  description = "Types for API gateway endpoint configuration"
}
