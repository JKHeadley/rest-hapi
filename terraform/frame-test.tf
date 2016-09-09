resource "aws_instance" "frame-test" {
    ami = "${lookup(var.amis, var.region)}"
    instance_type = "t2.micro"
    key_name = "frame-test"
    tags {
      Name = "frame-test"
    }
    security_groups = [
      "${aws_security_group.allow_all.name}"
    ]
}

