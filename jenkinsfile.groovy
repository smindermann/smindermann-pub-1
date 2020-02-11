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


        /*stage("Remote Deploy"){
            //TODO: do branch check- If Development branch ---> Deploy to development environment, If master branch --> Deploy to Production Environment
            steps{
                script{
                    def remote = [:]
                    remote.name = 'Chords Central Web host'
                    remote.host = 'chords-central-web-1.speelyaal.io'
                    remote.user = 'root'
                    remote.password = 'chords@december'
                    remote.allowAnyHosts = true
                      //Stop all containers
                      //sshCommand remote: remote, command: "docker container stop speelyaal/atlassian-app-visualize-issues"



                        //Remove all containers
                      sshCommand remote: remote, command: "docker rm \$(docker stop \$(docker ps -a -q --filter ancestor=speelyaal/chords-central-web:tst --format=\"{{.ID}}\"))", failOnError: false

                        //Delete the existing images
                      sshCommand remote: remote, command: "docker rmi speelyaal/chords-central-web:tst", failOnError: false

                        //Docker Login
                       sshCommand remote: remote, command: "docker login -u speelyaal -p ${DOCKER_HUB_PASSWORD}"
                        //Start the app again
                      sshCommand remote: remote, command: "docker run -p 1205:80 -d speelyaal/chords-central-web:tst"



                }
            }
        }*/

        stage("Cleanup Jenkins"){
                steps{
                        script {
                            sh "docker system prune -f"
                        }

                     }
        }

     }//stages

}//pipeline
