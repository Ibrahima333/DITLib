pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'ditlib'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            parallel {
                stage('livres-service') {
                    steps {
                        dir('livres-service') {
                            sh '''
                                python3 -m venv .venv
                                . .venv/bin/activate
                                pip install --no-cache-dir -r requirements.txt
                                python -m pytest --junitxml=test-results.xml
                            '''
                        }
                    }
                    post {
                        always {
                            junit 'livres-service/test-results.xml'
                        }
                    }
                }
                stage('utilisateurs-service') {
                    steps {
                        dir('utilisateurs-service') {
                            sh '''
                                python3 -m venv .venv
                                . .venv/bin/activate
                                pip install --no-cache-dir -r requirements.txt
                                python -m pytest --junitxml=test-results.xml
                            '''
                        }
                    }
                    post {
                        always {
                            junit 'utilisateurs-service/test-results.xml'
                        }
                    }
                }
                stage('emprunts-service') {
                    steps {
                        dir('emprunts-service') {
                            sh '''
                                python3 -m venv .venv
                                . .venv/bin/activate
                                pip install --no-cache-dir -r requirements.txt
                                python -m pytest --junitxml=test-results.xml
                            '''
                        }
                    }
                    post {
                        always {
                            junit 'emprunts-service/test-results.xml'
                        }
                    }
                }
            }
        }

        stage('Frontend Lint & Build') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run lint
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                withCredentials([file(credentialsId: 'ditlib-env-file', variable: 'ENV_FILE')]) {
                    sh 'docker compose --env-file "$ENV_FILE" build'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down'
                withCredentials([file(credentialsId: 'ditlib-env-file', variable: 'ENV_FILE')]) {
                    sh 'docker compose --env-file "$ENV_FILE" up -d'
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if curl -sf http://localhost:8011/health \
                            && curl -sf http://localhost:8002/health \
                            && curl -sf http://localhost:8003/health \
                            && curl -sf http://localhost:8080/ > /dev/null; then
                            echo "Tous les services sont up"
                            exit 0
                        fi
                        echo "En attente des services... ($i/30)"
                        sleep 2
                    done
                    echo "Les services ne sont pas up apres 60s"
                    docker compose logs
                    exit 1
                '''
            }
        }
    }

    post {
        failure {
            sh 'docker compose logs --tail=100 || true'
        }
    }
}
