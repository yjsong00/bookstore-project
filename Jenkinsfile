pipeline {
    agent any
    environment {
        GITNAME = 'HyunmoBae'
        GITEMAIL = 'tsi0520@naver.com'
        GITWEBADD = 'https://github.com/HyunmoBae/bookstore.git'
        GITCREDENTIAL = 'git_cre'
        AWSCREDENTIAL = 'aws_cre'
        REGION = 'ap-northeast-2'
        BUCKET = 'www.taehyun35802.shop'
    }
    stages {
        stage('Checkout Github') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/frontend']], extensions: [],
                userRemoteConfigs: [[credentialsId: GITCREDENTIAL, url: GITWEBADD]]])
            }
            post {
                failure {
                    echo "Clone failed"
                }
                success {
                    echo "Clone success"
                }
            }
        }
        stage('Npm Build') {
            steps {
                sh "npm install"
                sh "npm run build"
            }
            post {
                failure {
                    echo "npm build failed"
                }
                success {
                    echo "npm build success"
                }
            }
        }
        stage('S3 Delete') {
            steps {
                withAWS(region: "${REGION}", credentials: "${AWSCREDENTIAL}") {
                    // S3에 있는 파일들 삭제
                    s3Delete(bucket: "${BUCKET}", path: '')
                    cfInvalidate(distribution:'E1HN3G0TOGIK6L', paths:['/*'], waitForCompletion: true) // Cloudfront 캐시 무효화
                }
            }
            post {
                failure {
                    echo "S3 Delete failed"
                }
                success {
                    echo "S3 Delete success"
                }
            }
        }
        stage('S3 Upload') {
            steps {
                withAWS(region: "${REGION}", credentials: "${AWSCREDENTIAL}") {
                    // S3에 파일 업로드
                    s3Upload(file: 'out', bucket: "${BUCKET}", path: '')
                }
            }
            post {
                failure {
                    echo "S3 Upload failed"
                }
                success {
                    echo "S3 Upload success"
                }
            }
        }
    }
}