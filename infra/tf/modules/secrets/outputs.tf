output "feedbacks_db_uri" {
  value = data.doppler_secrets.this.map.FEEDBACKS_DB_URI
}

output "events_db_uri" {
  value = data.doppler_secrets.this.map.EVENTS_DB_URI
}

output "tickets_db_uri" {
  value = data.doppler_secrets.this.map.TICKETS_DB_URI
}
