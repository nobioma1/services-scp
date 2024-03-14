output "frontend_url" {
  description = "Frontend URL"
  value       = module.s3_static_website.static_website_url
}

output "events_url" {
  description = "Events service URL"
  value       = aws_apigatewayv2_stage.events_stage.invoke_url
}

output "tickets_url" {
  description = "Tickets service URL"
  value       = aws_apigatewayv2_stage.tickets_stage.invoke_url
}

output "feedbacks_queue_url" {
  description = "Feedbacks Queue URL"
  value       = aws_sqs_queue.feedback_ratings_queue.url
}

# output "feedbacks_url" {
#   description = "Feedbacks service URL"
#   value       = module.aws-feedbacks-elasticbeanstalk.eb_environment_domain
# }

