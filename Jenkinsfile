pipeline {
    agent any
    environment {
        GITNAME = 'HyunmoBae'
        GITEMAIL = 'tsi0520@naver.com'
        GITWEBADD = 'https://github.com/HyunmoBae/bookstore.git'
        GITSSHADD = 'git@github.com:HyunmoBae/bookstore-eks-deploy.git'
        GITCREDENTIAL = 'git_cre'
        AWSCREDENTIAL = 'aws_cre'
        REGION = 'ap-northeast-2'
        BUCKET = 'www.taehyun35802.shop'
        ECR_BASE = '178020491921.dkr.ecr.ap-northeast-2.amazonaws.com'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: GITCREDENTIAL, url: GITWEBADD]]])
            }
        }
        
        stage('Determine Changes') {
            steps {
                script {
                    def changes = sh(returnStdout: true, script: 'git diff --name-only HEAD^ HEAD').trim()
                    env.FRONTEND_CHANGED = changes.contains('frontend/')
                    env.RECOMMEND_CHANGED = changes.contains('recommend/')
                    env.RESERVATION_CHANGED = changes.contains('reservation/')
                    env.PERSONALIZE_CHANGED = changes.contains('personalize/')
                    env.MYPAGE_CHANGED = changes.contains('mypage/')
                }
            }
        }
        
        // Frontend Pipeline
        stage('Frontend: Build and Deploy') {
            when { expression { env.FRONTEND_CHANGED == 'true' } }
            steps {
                dir('frontend') {
                    sh "npm install"
                    sh "npm run build"
                    withAWS(region: "${REGION}", credentials: "${AWSCREDENTIAL}") {
                        s3Delete(bucket: "${BUCKET}", path: '')
                        s3Upload(file: 'out', bucket: "${BUCKET}", path: '')
                        cfInvalidate(distribution:'E1HN3G0TOGIK6L', paths:['/*'], waitForCompletion: true)
                    }
                }
            }
        }

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
        // Build Docker Image
        sh "docker build --no-cache -t ${awsecr}:${currentBuild.number} ."
        sh "docker tag ${awsecr}:${currentBuild.number} ${awsecr}:latest"
        
        // Push Docker Image
        script {
            docker.withRegistry("https://${awsecr}", "ecr:${REGION}:${AWSCREDENTIAL}") {
                docker.image("${awsecr}:${currentBuild.number}").push()
                docker.image("${awsecr}:latest").push()
            }
        }
        
        // Clean up Docker images
        sh "docker image rm -f ${awsecr}:${currentBuild.number}"
        sh "docker image rm -f ${awsecr}:latest"
        
        // Update EKS manifest
        dir('../') {  // Move back to root directory
            git credentialsId: GITCREDENTIAL, url: GITSSHADD, branch: 'main'
            sh "git config --global user.email ${GITEMAIL}"
            sh "git config --global user.name ${GITNAME}"
            sh "sed -i 's@${awsecr}:.*@${awsecr}:${currentBuild.number}@g' ${serviceName}/${serviceName}.yaml"
            sh "git add ."
            sh "git commit -m 'Update ${serviceName} to ${currentBuild.number}'"
            sh "git push origin main"
        }
    }
}