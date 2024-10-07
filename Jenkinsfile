pipeline {
    agent any
    environment {
        GITNAME = 'HyunmoBae'
        GITEMAIL = 'tsi0520@naver.com'
        GITWEBADD = 'https://github.com/HyunmoBae/bookstore-project.git'
        GITSSHADD = 'git@github.com:HyunmoBae/bookstore-eks-deploy.git'
        GITCREDENTIAL = 'git_cre'
        AWSCREDENTIAL = 'aws_cre'
        REGION = 'ap-northeast-2'
        BUCKET = 'www.taehyun35802.shop'
        ECR_BASE = '178020491921.dkr.ecr.ap-northeast-2.amazonaws.com'
    }
    stages {
        // ... (이전 stages는 그대로 유지)

        // Backend Services Pipeline (Recommend, Reservation, Personalize, Mypage)
        stage('Backend Services: Build and Deploy') {
            parallel {
                stage('Recommend') {
                    when { expression { env.RECOMMEND_CHANGED == 'true' } }
                    steps {
                        buildAndDeployService('recommend')
                    }
                }
                stage('Reservation') {
                    when { expression { env.RESERVATION_CHANGED == 'true' } }
                    steps {
                        buildAndDeployService('reservation')
                    }
                }
                stage('Personalize') {
                    when { expression { env.PERSONALIZE_CHANGED == 'true' } }
                    steps {
                        buildAndDeployService('personalize')
                    }
                }
                stage('Mypage') {
                    when { expression { env.MYPAGE_CHANGED == 'true' } }
                    steps {
                        buildAndDeployService('mypage')
                    }
                }
            }
        }
    }
}

def buildAndDeployService(String serviceName) {
    def awsecr = "${ECR_BASE}/${serviceName}"
    dir(serviceName) {
        // Get the latest tag and increment it
        def latestTag = sh(
            script: "aws ecr describe-images --repository-name ${serviceName} --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' --output text",
            returnStdout: true
        ).trim()
        
        def nextTag
        if (latestTag ==~ /^\d+$/) {
            nextTag = (latestTag.toInteger() + 1).toString()
        } else {
            nextTag = "1"
        }

        // Build Docker Image
        sh "docker build --no-cache -t ${awsecr}:${nextTag} ."
        sh "docker tag ${awsecr}:${nextTag} ${awsecr}:latest"
        
        // Push Docker Image
        script {
            docker.withRegistry("https://${awsecr}", "ecr:${REGION}:${AWSCREDENTIAL}") {
                docker.image("${awsecr}:${nextTag}").push()
                docker.image("${awsecr}:latest").push()
            }
        }
        
        // Clean up Docker images
        sh "docker image rm -f ${awsecr}:${nextTag}"
        sh "docker image rm -f ${awsecr}:latest"
        
        // Update EKS manifest
        dir('../') {  // Move back to root directory
            git credentialsId: GITCREDENTIAL, url: GITSSHADD, branch: 'main'
            sh "git config --global user.email ${GITEMAIL}"
            sh "git config --global user.name ${GITNAME}"
            sh "sed -i 's@${awsecr}:.*@${awsecr}:${nextTag}@g' ${serviceName}/${serviceName}.yaml"
            sh "git add ."
            sh "git commit -m 'Update ${serviceName} to ${nextTag}'"
            sh "git push origin main"
        }
    }
}