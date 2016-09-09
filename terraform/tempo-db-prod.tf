resource "aws_db_instance" "tempo-db-prod" {
  allocated_storage    = 100
  engine               = "mysql"
  engine_version       = "5.6.27"
  instance_class       = "db.m3.large"
  identifier           = "tempo-db-prod"
  name                 = "tempo_db_prod"
  username             = "${var.db_users.prod}"
  password             = "${var.db_passwords.prod}"
  parameter_group_name = "default.mysql5.6"
  vpc_security_group_ids = [
    "${aws_security_group.allow_all.id}"
  ]
}