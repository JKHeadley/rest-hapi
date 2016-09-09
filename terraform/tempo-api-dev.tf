resource "aws_instance" "tempo-api-dev" {
    ami = "${lookup(var.amis, var.region)}"
    instance_type = "m4.large"
    key_name = "tempo-api-dev"
    tags {
      Name = "tempo-api-dev"
    }
    security_groups = [
      "${aws_security_group.allow_all.name}"
    ]
}

