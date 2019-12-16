
# Prerequisites: A Ubuntu 18.04 VM
1. Verify the application manually

	*	Install Nodejs latest version
		    *  https://nodejs.org/en/download/
	*	Install git
	        *  https://linuxize.com/post/how-to-install-git-on-ubuntu-18-04/

	*	Checkout/Clone the Example Application repository to a local directory
	        *	https://github.com/ashokaklt/angular-cicd-app.git
	        *	https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository
	*	Run and test the application(without docker)
	        *	Open a Terminal and go to directory of the sample application
	        *	Run:

	        ```
         npm install
            ```

	        ```
	      npm start
            ```

	*	Verify the application
	        *	Open a browser and navigate to http://localhost:8080
	        *	Check whether the application loads properly

1. Dockerize the web application
	* Install & verify Docker on Ubuntu
	    * https://docs.docker.com/install/linux/docker-ce/ubuntu/

	* Review the Dockerfile in the application directory for understanding. This file content changes based on the technology programming language etc., but the concept of Dockerfile and docker build remains same for all type of technologies.
	Execute the below commands in the terminal(applicaiton directory)

```
docker build -t  {username}/{repository}  .
```
```
docker run -d -p 8080:8080 {username}/{repository}
```

    * Verify the application
        *	Open a browser and navigate to http://localhost:8080
    	*	Check whether the application loads properly
