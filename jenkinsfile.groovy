pipeline {
    agent {
            docker {
                image 'node'
                args '-p 3000:3000'
            }
        }
          environment{
                def DOCKER_HUB_USERNAME = credentials('docker-hub-username')
                def DOCKER_HUB_PASSWORD = credentials('docker-hub-password')
                def AZLXDOC13_user = credentials('AZLXDOC13_user')
                def AZLXDOC13_pw = credentials('AZLXDOC13_pw')
            
                def ENVIRONMENT_CODE= ''
            }
    stages{
        stage("Compile"){

         steps{
                sh "npm install"
                sh "npm build"
            }
        }
       /*  stage("Unit Test"){
            steps{
            //    sh "npm test"
            }
        } */
        stage("Package"){
            steps{
                sh "npm build"
            }
        }
        stage("Docker Build"){

            //TODO: add snapshot tag for Development build and proper tag for production(master) with branch condition check
            steps{

                sh "docker build -t smindermann/docker-rep-pub-01:v1.0 ."
            }
        }

        stage("Docker Push"){
            steps{
                script {

                    sh "docker login -u ${DOCKER_HUB_USERNAME}  -p  ${DOCKER_HUB_PASSWORD}"
                    //TODO: add snapshot tag for development build and proper version/tag for production(master) with branch condition check

                    sh "docker push smindermann/docker-rep-pub-01:v1.0"
                   /* docker.withRegistry('repo.yaal.be', 'nexus-id') {

                    }*/
                }
            }
        }


        stage("Remote Deploy"){
            //TODO: deploy to AZLXDOC13
            steps{
                script{
                    def remote = [:]
                    remote.name = 'AZLXDOC13'
                    remote.host = '23.101.76.43'
                    remote.user = AZLXDOC13_user
                    remote.password = AZLXDOC13_pw
                    remote.allowAnyHosts = true
                      //Stop all containers
                      //sshCommand remote: remote, command: "docker container stop speelyaal/atlassian-app-visualize-issues"



                        //Remove all containers
                      sshCommand remote: remote, command: "sudo docker rm \$(docker stop \$(docker ps -a -q --filter ancestor=smindermann/docker-rep-pub-01:v1.0 --format=\"{{.ID}}\"))", failOnError: false

                        //Delete the existing images
                      sshCommand remote: remote, command: "sudo docker rmi smindermann/docker-rep-pub-01:v1.0", failOnError: false

                        //Docker Login
                       sshCommand remote: remote, command: "sudo docker login -u ${DOCKER_HUB_USERNAME} -p ${DOCKER_HUB_PASSWORD}"
                        //Start the app again
                      sshCommand remote: remote, command: "sudo docker run -p 5100:4200 -d smindermann/docker-rep-pub-01:v1.0"



                }
            }
        }

        stage("Cleanup Jenkins"){
                steps{
                        script {
                            sh "sudo docker system prune -f"
                        }

                     }
        }

     }//stages

}//pipeline
