pipeline {
    agent any
    environment {
        GITNAME = 'HyunmoBae'
        GITEMAIL = 'tsi0520@naver.com'
        GITWEBADD = 'https://github.com/HyunmoBae/bookstore.git'
        GITSSHADD = 'git@github.com:HyunmoBae/bookstore-eks-deploy.git'
        GITCREDENTIAL = 'git_cre'
        AWSCREDENTIAL = 'aws_cre'
        AWSECR = '178020491921.dkr.ecr.ap-northeast-2.amazonaws.com/reservation'
        REGION = 'ap-northeast-2'
    }
    stages {
        stage('Checkout Github') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/reservation']], extensions: [],
                userRemoteConfigs: [[credentialsId: GITCREDENTIAL, url: GITWEBADD]]])
            }
            post {
                failure {
                    sh "echo clone failed"
                }
                success {
                    sh "echo clone success"
                }
            }
        }
        stage('Docker Image Build') {
            steps {
                sh "docker build --no-cache -t ${AWSECR}:${currentBuild.number} ."
                sh "docker tag ${AWSECR}:${currentBuild.number} ${AWSECR}:latest"
            }
            post {
                failure {
                    sh "echo image build failed"
                }
                success {
                    sh "echo image build success"
                }
            }
        }
        stage('Docker Image Push') {
            steps {
                script {
                    docker.withRegistry("https://${AWSECR}", "ecr:${REGION}:${AWSCREDENTIAL}") {
                        docker.image("${AWSECR}:${currentBuild.number}").push()
                        docker.image("${AWSECR}:latest").push()
                    }
                }
            }
            post {
                failure {
                    sh "docker image rm -f ${AWSECR}:${currentBuild.number}"
                    sh "docker image rm -f ${AWSECR}:latest"
                    sh "echo push failed"
                }
                success {
                    sh "docker image rm -f ${AWSECR}:${currentBuild.number}"
                    sh "docker image rm -f ${AWSECR}:latest"
                    sh "echo push success"
                }
            }
        }
        stage('EKS manifest file update') {
            steps {
                git credentialsId: GITCREDENTIAL, url: GITSSHADD, branch: 'main'
                sh "git config --global user.email ${GITEMAIL}"
                sh "git config --global user.name ${GITNAME}"
                sh "sed -i 's@${AWSECR}:.*@${AWSECR}:${currentBuild.number}@g' reservation/reservation.yaml"

                sh "git add ."
                sh "git branch -M main"
                sh "git commit -m 'fixed tag ${currentBuild.number}'"
                sh "git remote remove origin"
                sh "git remote add origin ${GITSSHADD}"
                sh "git push origin main"
            }
            post {
                failure {
                    sh "echo manifest update failed"
                }
                success {
                    sh "echo manifest update success"
                }
            }
        }

    }
}