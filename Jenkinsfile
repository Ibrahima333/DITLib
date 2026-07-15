// test de push
pipeline {

    agent {
        label 'local'
    }

    environment {
        DOCKERHUB_USER = "ditdevops1"

        LIVRES_IMAGE       = "${DOCKERHUB_USER}/livres-service-ditlib"
        UTILISATEURS_IMAGE = "${DOCKERHUB_USER}/utilisateurs-service-ditlib"
        EMPRUNTS_IMAGE     = "${DOCKERHUB_USER}/emprunts-service-ditlib"
        FRONTEND_IMAGE     = "${DOCKERHUB_USER}/frontend-ditlib"

        LIVRES_TAG       = "1.${BUILD_NUMBER}"
        UTILISATEURS_TAG = "1.${BUILD_NUMBER}"
        EMPRUNTS_TAG     = "1.${BUILD_NUMBER}"
        FRONTEND_TAG     = "1.${BUILD_NUMBER}"

        COMPOSE_PROJECT_NAME = 'ditlib'
    }

    stages {

        // Checkout code source Backend (3 microservices) + Frontend
        stage('Checkout Backend + Frontend') {
            steps {
                checkout scm
            }
        }

        // Build livres-service Docker Image
        stage('Build livres-service Docker Image') {
            steps {
                dir('livres-service') {
                    script {
                        sh "docker build -t ${LIVRES_IMAGE}:${LIVRES_TAG} ."
                    }
                }
            }
        }

        // Build utilisateurs-service Docker Image
        stage('Build utilisateurs-service Docker Image') {
            steps {
                dir('utilisateurs-service') {
                    script {
                        sh "docker build -t ${UTILISATEURS_IMAGE}:${UTILISATEURS_TAG} ."
                    }
                }
            }
        }

        // Build emprunts-service Docker Image
        stage('Build emprunts-service Docker Image') {
            steps {
                dir('emprunts-service') {
                    script {
                        sh "docker build -t ${EMPRUNTS_IMAGE}:${EMPRUNTS_TAG} ."
                    }
                }
            }
        }

        // Build Frontend Docker Image
        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    script {
                        sh "docker build -t ${FRONTEND_IMAGE}:${FRONTEND_TAG} ."
                    }
                }
            }
        }

        // Déployer les services avec Docker Compose en mode détaché
        stage('Deploy with Docker Compose') {
            steps {
                sh "docker compose up -d --build"
            }
        }

    }

    post {

        success {
            echo "✅ CI/CD ditLib réussi !"
        }

        failure {
            echo "❌ Le pipeline a échoué, vérifiez les logs Jenkins."
        }

    }

}
