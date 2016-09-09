resource "aws_instance" "tempo-api-prod" {
    ami = "${lookup(var.amis, var.region)}"
    instance_type = "m4.large"
    key_name = "tempo-api-prod"
    tags {
      Name = "tempo-api-prod"
    }
    security_groups = [
      "${aws_security_group.allow_all.name}"
    ]
}

