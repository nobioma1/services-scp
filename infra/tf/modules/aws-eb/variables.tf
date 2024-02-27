variable "eb_application_name" {
  type        = string
  description = "Elastic Beanstalk Application Name"
}

variable "eb_env_name" {
  type        = string
  description = "Elastic Beanstalk Environment name"
}

variable "eb_env_instance_profile" {
  type        = string
  description = "Elastic Beanstalk Environment IamInstanceProfile"
}

variable "eb_env_solution_stack_name" {
  type        = string
  description = "Elastic Beanstalk Environment Solution Stack Name"
}

variable "eb_environment_type" {
  type        = string
  description = "Elastic Beanstalk Environment Type (Single Instance | LoadBalanced)"
}

variable "environment_variables" {
  default     = []
  description = "A list of environment variables for the application"
  type = list(object({
    name  = string
    value = string
  }))
}



