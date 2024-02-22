output "eb_environment_domain" {
  value = aws_elastic_beanstalk_environment.eb_application_env.cname
  description = "The domain name of the Elastic Beanstalk environment."
}

output "eb_environment_name" {
  value = aws_elastic_beanstalk_environment.eb_application_env.name
  description = "The name of the Elastic Beanstalk environment."
}

output "eb_application_name" {
  value = aws_elastic_beanstalk_application.eb_application.name
  description = "The name of the Elastic Beanstalk application."
}