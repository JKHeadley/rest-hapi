resource "aws_db_instance" "scalio-frame-db" {
  allocated_storage    = 100
  engine               = "mysql"
  engine_version       = "5.6.27"
  instance_class       = "db.t2.micro"
  identifier           = "scalio-frame-db"
  name                 = "scalio_frame_db"
  username             = "${var.db_users.dev}"
  password             = "${var.db_passwords.dev}"
  parameter_group_name = "default.mysql5.6"
  vpc_security_group_ids = [
    "${aws_security_group.allow_all.id}"
  ]
}