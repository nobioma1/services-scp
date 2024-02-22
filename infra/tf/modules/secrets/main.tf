# define data source to fetch secrets
data "doppler_secrets" "this" {
  config = terraform.workspace
}
