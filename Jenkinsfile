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
        BUCKET = 'www.linkedbook.shop'
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
                        cfInvalidate(distribution:'E1D3GIGSIQUMEZ', paths:['/*'], waitForCompletion: true)
                    }
                    sh "rm -rf node_modules"
                    sh "rm -rf out"
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
        
        // Push Docker Image
        script {
            docker.withRegistry("https://${awsecr}", "ecr:${REGION}:${AWSCREDENTIAL}") {
                docker.image("${awsecr}:${nextTag}").push()
            }
        }
        
        // Clean up Docker images
        sh "docker image rm -f ${awsecr}:${nextTag}"
        
        // Update EKS manifest and clean up Git repository
        dir('../') {  // Move back to root directory
            git credentialsId: GITCREDENTIAL, url: GITSSHADD, branch: 'main'
            
            sh "git config --global user.email ${GITEMAIL}"
            sh "git config --global user.name ${GITNAME}"
            
            // Update EKS manifest
            sh "sed -i 's@${awsecr}:.*@${awsecr}:${nextTag}@g' ${serviceName}/${serviceName}.yaml"
            sh "git add ${serviceName}/${serviceName}.yaml"
            sh "git commit -m 'Update ${serviceName} to ${nextTag}'"
            
            // Push changes
            sh "git push origin main"
        }
    }
}
