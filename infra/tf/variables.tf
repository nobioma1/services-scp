variable "project_name" {
  type        = string
  default     = "scp-services"
  description = "project name"
}

variable "aws_default_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS Region is a geographical area where AWS resources and services are hosted."
}

variable "doppler_token" {
  type        = string
  description = "A token to authenticate with Doppler"
  default     = "dp.sa.7zR5ucLrUuVGL0jZBgUzZYI9nm86Up9jVL1mW1L1PKu"
}