variable "access_key" {}
variable "secret_key" {}
variable "region" {
    default = "us-west-2"
}
variable "amis" {
    default = {}
}
variable "db_users" {
    default = {}
}
variable "db_passwords" {
    default = {}
}