require 'socket'
Vagrant.configure("2") do |config|
  config.vm.hostname = Socket.gethostname + '.vagrant'
  config.vm.box = "vagrant-node-0.10-0.0.6"
  config.vm.box_url = "https://github.com/GeoffreyPlitt/vagrant-node-0.10/releases/download/0.0.6/vagrant-node-0.10-0.0.6.box"
  config.vm.provision :shell, :inline => $BOOTSTRAP_SCRIPT # see below
end

$BOOTSTRAP_SCRIPT = <<EOF
  set -e # Stop on any error

  export DEBIAN_FRONTEND=noninteractive

  # Make vagrant automatically go to /vagrant when we ssh in.
  echo "cd /vagrant" | sudo tee -a ~vagrant/.profile

  echo VAGRANT IS READY.
EOF
