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

variable "environment_variables" {
  default = []
  description = "A list of environment variables for the application"
  type = list(object({
    name  = string
    value = string
  }))
}



