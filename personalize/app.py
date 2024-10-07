from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3

app = Flask(__name__)
CORS(app)

# Amazon Personalize 클라이언트 생성
personalize_runtime = boto3.client('personalize-runtime', region_name='ap-northeast-2')

# 두 캠페인의 ARNi
#user_personalization_campaign_arn = 'arn:aws:personalize:ap-northeast-2:178020491921:campaign/user-s'
#personalized_ranking_campaign_arn = 'arn:aws:personalize:ap-northeast-2:178020491921:campaign/ranking-cam'
#popularity_campaign_arn = 'arn:aws:personalize:ap-northeast-2:178020491921:campaign/popul-cam'

# 기본 추천 아이템 (백업 데이터)
default_popularity_recommendations = [
    "KCCBSPO22N000000492",
    "KCCBSPO22N000000445",
    "KCCBSPO22N000000559",
    "KCCBSPO22N000000595",
    "KCCBSPO22N000000500",
    "KCCBSPO22N000000608",
    "KCCBSPO22N000000558",
    "KCCBSPO22N000000579",
    "KCCBSPO22N000000538",
    "KCCBSPO22N000000448"
]

# 사용자 ID로 추천 아이템 가져오기 (User Personalization)
def get_recommendations(user_id):
    try:
        response = personalize_runtime.get_recommendations(
            campaignArn=user_personalization_campaign_arn,
            userId=user_id
        )
        return [item['itemId'] for item in response['itemList'][:10]]
    except Exception as e:
        print(f"User Personalization API 호출 오류: {e}")
        return None

# 추천 아이템 목록을 사용자의 선호도에 맞게 재정렬 (Personalized Ranking)
def get_personalized_ranking(user_id, item_list):
    try:
        response = personalize_runtime.get_personalized_ranking(
            campaignArn=personalized_ranking_campaign_arn,
            userId=user_id,
            inputList=item_list
        )
        return [item['itemId'] for item in response['personalizedRanking']]
    except Exception as e:
        print(f"Personalized Ranking API 호출 오류: {e}")
        return item_list  # API 호출 실패 시 기본 아이템 순서 유지

# 추천 아이템을 가져오는 API 엔드포인트
@app.route('/get-recommendations', methods=['GET'])
def get_recommendations_endpoint():
    user_id = request.args.get('userId')  # 쿼리 파라미터에서 userId 가져오기

    try:
        if user_id:  # 로그인된 경우
            # User Personalization 및 Ranking을 통한 추천 아이템 가져오기
            personalized_recommendations = get_recommendations(user_id)
            if personalized_recommendations:
                ranked_items = get_personalized_ranking(user_id, personalized_recommendations)
            else:
                ranked_items = default_popularity_recommendations

            # 인기도 캠페인에서 추천 아이템 가져오기
            popularity_response = personalize_runtime.get_recommendations(
                campaignArn=popularity_campaign_arn,
                userId=user_id
            )
            popularity_items = [item['itemId'] for item in popularity_response['itemList'][:10]]  # 최대 10개
        else:
            # 로그인되지 않은 경우 기본 인기도 추천 반환
            popularity_response = personalize_runtime.get_recommendations(
                campaignArn=popularity_campaign_arn,
                userId='defaultUserId'
            )
            popularity_items = [item['itemId'] for item in popularity_response['itemList'][:10]]  # 최대 10개
            ranked_items = []

        return jsonify({
            'personalizedRecommendations': ranked_items if ranked_items else default_popularity_recommendations,
            'popularityRecommendations': popularity_items if popularity_items else default_popularity_recommendations
        })

    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")
        return jsonify({
            'popularityRecommendations': default_popularity_recommendations
        })

# 헬스 체크 엔드포인트
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', "message": "hi i'm yejin"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

