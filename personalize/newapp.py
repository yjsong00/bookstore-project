import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3

app = Flask(__name__)
CORS(app)

# Amazon Personalize 클라이언트 생성
personalize_runtime = boto3.client('personalize-runtime', region_name='ap-northeast-2')

# 환경 변수에서 캠페인 ARN 가져오기
user_personalization_campaign_arn = os.getenv('USER_PERSONALIZATION_CAMPAIGN_ARN')
personalized_ranking_campaign_arn = os.getenv('PERSONALIZED_RANKING_CAMPAIGN_ARN')
popularity_campaign_arn = os.getenv('POPULARITY_CAMPAIGN_ARN')

# 사용자 ID로 추천 아이템 가져오기 (User Personalization)
def get_recommendations(user_id):
    response = personalize_runtime.get_recommendations(
        campaignArn=user_personalization_campaign_arn,
        userId=user_id
    )
    return [item['itemId'] for item in response['itemList'][:10]]

# 추천 아이템 목록을 사용자의 선호도에 맞게 재정렬 (Personalized Ranking)
def get_personalized_ranking(user_id, item_list):
    response = personalize_runtime.get_personalized_ranking(
        campaignArn=personalized_ranking_campaign_arn,
        userId=user_id,
        inputList=item_list
    )
    return [item['itemId'] for item in response['personalizedRanking']]

# 추천 아이템을 가져오는 API 엔드포인트
@app.route('/get-recommendations', methods=['GET'])
def get_recommendations_endpoint():
    user_id = request.args.get('userId')  # 쿼리 파라미터에서 userId 가져오기
    if user_id:  # 로그인된 경우
        # User Personalization 및 Ranking을 통한 추천 아이템 가져오기
        personalized_recommendations = get_recommendations(user_id)
        ranked_items = get_personalized_ranking(user_id, personalized_recommendations)
        
        # 인기도 캠페인에서 추천 아이템 가져오기
        popularity_response = personalize_runtime.get_recommendations(
            campaignArn=popularity_campaign_arn,
            userId=user_id
        )
        popularity_items = [item['itemId'] for item in popularity_response['itemList'][:10]]  # 최대 10개
        # 두 가지 추천 아이템을 반환
        return jsonify({
            'personalizedRecommendations': ranked_items,
            'popularityRecommendations': popularity_items
        })
    else:  # 로그인되지 않은 경우
        # 인기도 캠페인에서 추천 아이템 가져오기
        popularity_response = personalize_runtime.get_recommendations(
            campaignArn=popularity_campaign_arn,
            userId='defaultUserId'  # 기본 사용자 ID 사용
        )
        popularity_items = [item['itemId'] for item in popularity_response['itemList'][:10]]  # 최대 10개
        
        # 인기도 추천 아이템만 반환
        return jsonify({
            'popularityRecommendations': popularity_items
        })

# 캠페인 생성 API 엔드포인트
@app.route('/create-campaign', methods=['POST'])
def create_campaign():
    # 요청에서 캠페인 생성에 필요한 파라미터 받기
    data = request.json
    campaign_name = data['campaignName']
    solution_arn = data['solutionArn']
    
    # 캠페인 생성 로직
    create_response = personalize_runtime.create_campaign(
        name=campaign_name,
        solutionVersionArn=solution_arn,
        minProvisionedTPS=1
    )
    
    # 생성된 캠페인의 ARN 반환
    campaign_arn = create_response['campaignArn']
    return jsonify({'campaignArn': campaign_arn})

# 캠페인 삭제 API 엔드포인트
@app.route('/delete-campaign', methods=['POST'])
def delete_campaign():
    # 캠페인 삭제 로직 (캠페인 ARN이 필요)
    campaign_arn = os.getenv('USER_PERSONALIZATION_CAMPAIGN_ARN')  # 환경 변수로 캠페인 ARN 받기
    response = personalize_runtime.delete_campaign(campaignArn=campaign_arn)
    return jsonify({'status': 'success', 'message': 'Campaign deleted successfully'})

# 헬스 체크 엔드포인트
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
