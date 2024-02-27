resource "aws_elastic_beanstalk_application" "eb_application" {
  name = var.eb_application_name
}

resource "aws_elastic_beanstalk_environment" "eb_application_env" {
  name                = var.eb_env_name
  application         = aws_elastic_beanstalk_application.eb_application.name
  solution_stack_name = var.eb_env_solution_stack_name
  tier                = "WebServer"

  setting {
    name      = "EnvironmentType"
    namespace = "aws:elasticbeanstalk:environment"
    value     = var.eb_environment_type
  }

  setting {
    name      = "IamInstanceProfile"
    namespace = "aws:autoscaling:launchconfiguration"
    value     = var.eb_env_instance_profile
  }

  dynamic "setting" {
    for_each = var.environment_variables

    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.value["name"]
      value     = setting.value["value"]
    }
  }
}