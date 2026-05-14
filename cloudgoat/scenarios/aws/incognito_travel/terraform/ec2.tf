resource "aws_security_group" "flask_sg" {
  name        = "incognito-travel-proxy-sg-${var.cgid}"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.cg_whitelist
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

resource "aws_instance" "backend_server" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.flask_sg.id]
  
  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y python3-pip
              pip3 install flask flask-cors
              
              cat << 'PY_EOF' > /home/ec2-user/app.py
              ${file("${path.module}/../assets/backend/app.py")}
              PY_EOF

              # Run the app on port 80 (requires sudo)
              sudo python3 /home/ec2-user/app.py &
              EOF

  tags = {
    Name = "incognito-travel-backend-${var.cgid}"
  }
}
