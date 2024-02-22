variable "function_name" {
  type        = string
  description = "Lambda function name"
}

variable "handler" {
  type        = string
  description = "Lambda function handler name"
}

variable "runtime" {
  type        = string
  description = "Lambda function runtime"
}

variable "role_arn" {
  type        = string
  description = "IAM role ARN"
}

variable "source_dir" {
  type        = string
  description = "Lambda function source directory"
}

variable "output_path" {
  type        = string
  description = "Lambda package output path"
}

variable "environment_variables" {
  default     = {}
  type        = map(string)
  description = "Environment variables for the Lambda function"
}

variable "layers" {
  default     = []
  type        = list(string)
  description = "function layers"
}




