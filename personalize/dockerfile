# Python 이미지를 사용합니다.
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# virtualenv 설치
RUN pip install --no-cache-dir virtualenv

# 가상 환경 생성
RUN virtualenv venv

# 가상 환경 활성화
ENV VIRTUAL_ENV=/app/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# requirements.txt 파일 복사
COPY requirements.txt .

# 가상 환경에 필요한 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 애플리케이션 코드 복사
COPY . .

# 애플리케이션이 사용할 포트 노출
EXPOSE 5000

# Flask 애플리케이션 실행 명령
CMD ["python", "app.py"]

