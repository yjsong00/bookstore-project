# jenkins/ArgoCD로 CI/CD 파이프라인 구축하기.

## 구조

1. main -> develop -> feature/<해당기능> 으로 뻗어나가며, 순차적 pr을 통해 merge한다.

2. 각 서비스폴더에는 Dockerfile, 서비스.py 등 파일이 존재하고 개발 후 feature/<해당기능> 브랜치로 push하여 pr 생성

3. main브랜치로 merge되면 webhook을 통해 Jenkins로 요청을 보내며 pipeline 작동. (ECR 및 deploy repository로 push)

## Jenkins 인스턴스 생성.

t3.medium으로 인스턴스 생성후, 8080, 50000, 22번포트 열기.
인스턴스에 ecr에 접근할수 있는 권한 할당 (AmazonEC2ContainerRegistryFullAccess)

## Docker 설치

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

## Key,Repo 추가

apt update
wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

## 젠킨스 설치, 유저생성

apt install -y fontconfig openjdk-17-jre
apt-get update
apt-get install jenkins -y
usermod -aG docker jenkins
systemctl restart jenkins

## 젠킨스 접속

인스턴스 퍼블릭주소 8080포트로 접속.
cat /var/lib/jenkins/secrets/initialAdminPassword 으로 비밀번호 확인 후 접속.
패키지 install하기.
계정정보, url설정후 시작.

## 플러그인 설치

Docker, Docker Pipeline, Publish Over SSH, , AWS Credentials, Amazon ECR, AWS Steps, Generic Webhook Trigger Plugin 플러그인 설치
설치가 끝나고 실행중인 작업이 없으면 Jenkins 재시작 <- 체크확인

## Credential 설정

Global -> Add credential -> AWS credentials에서 aws_cre 생성

Global -> Add credential -> Username with password에서 git_cre 생성

jenkins, github에 ssh넣기, known host 추가

## item 만들기

이름작성 후 단일 pipeline 선택(나의 경우는 bookstore-project)
GitHub project 클릭후 repository URL 지정
Build Triggers의 Generic Webhook Trigger 지정 (나의경우 main 브랜치에 merged되면 파이프라인 실행)

Post content parameters에 2개의 파라미터 추가
각 파라미터 (변수명, 조건식)
variable : (IF_MERGED, BRANCH)
Expression : ($.pull_request.merged, $.pull_request.base.ref)

Token에 bookstore입력.(자유)
-> 해당 Token에 넣은 값을 webhook주소에 추가해줘야함.
ex) 나의경우는 bookstore를 넣었으니 github의 webhook url은 다음과 같음
http://jenkins.taehyun35802.shop:8080/generic-webhook-trigger/invoke?token=bookstore

## github 준비

github에서 repository만들고, 해당 리포지토리에 webhook추가

- Payload URL : 젠킨스주소:8080/generic-webhook-trigger/invoke?token=bookstore

## 시작

1. 로컬에서 develop 브랜치를 pull이나 clone 해온 뒤, 수정할 기능 브랜치를 생성
   ex) git pull origin develop후 git checkout -b feature/recommend (해당 브랜치를 만들고 switch)

2. 해당 기능에 대해 수정 후 해당 리포지토리의 feature/<해당기능> 으로 push
   ex) git push origin feature/recommend (이러면 해당 repository에 feature/recommend라는 브랜치가 만들어짐)

3. github에서 pull&request를 생성해서 feature/recommend 브랜치에서 develop브랜치로 pr 요청. (feature/recommend > develop으로 merge요청)

4. 리뷰어가 변경사항 확인 후 merge승인 (develop > main 도 마찬가지)

5. pr을 통해 develop에서 main으로 merge승인이 날 시, 위의 Jenkins에서 설정해놓은 조건식에 의해 main브랜치의 Jenkinsfile실행.
   -> 변경사항이 있는 폴더만 이미지를 다시 빌드하고, push작업을 실시
