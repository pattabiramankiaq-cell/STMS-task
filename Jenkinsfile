pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        SCANNER_HOME = tool 'SonarScanner'

        HARBOR_URL = "13.48.106.244"
        HARBOR_PROJECT = "smart-task-management-system"

        AUTH_IMAGE = "smart-task-management-system-auth-service"
        TASK_IMAGE = "smart-task-management-system-task-service"
        NOTIFICATION_IMAGE = "smart-task-management-system-notification-service"
        REPORT_IMAGE = "smart-task-management-system-report-service"
        API_IMAGE = "smart-task-management-system-api-gateway"
        FRONTEND_IMAGE = "smart-task-management-system-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        VAULT_ADDR = "http://13.48.106.244:8200"
        VAULT_SECRET_PATH = "secret/smart-task-management-system"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'git-creds',
                    url: 'https://github.com/KameshS021/Smart-Task-Management-System.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                cd frontend && npm install
                cd ../auth-service_1784011000189 && npm install
                cd ../task-service && npm install
                cd ../notification-service && npm install
                cd ../report-service && npm install
                cd ../api-gateway_1784010924579 && npm install
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                    -Dsonar.projectKey=Smart-Task-Management-System02 \
                    -Dsonar.projectName=Smart-Task-Management-System02 \
                    -Dsonar.sources=. \
                    -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        stage('Trivy File System Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --format table .'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                sh """
                trivy image --severity HIGH,CRITICAL ${AUTH_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${TASK_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${NOTIFICATION_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${REPORT_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${API_IMAGE}:latest
                trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Fetch Secrets From Vault & Harbor Login') {
            environment {
                VAULT_TOKEN = credentials('vault-token-smart')
                VAULT_ADDR = "http://13.48.106.244:8200"
            }

            steps {
                sh '''
                export VAULT_ADDR=$VAULT_ADDR
                export VAULT_SKIP_VERIFY=true
                export VAULT_TOKEN=$VAULT_TOKEN

                HARBOR_USER=$(vault kv get -field=HARBOR_USER secret/smart-task-management-system)
                HARBOR_PASSWORD=$(vault kv get -field=HARBOR_PASSWORD secret/smart-task-management-system)
                JWT_SECRET=$(vault kv get -field=JWT_SECRET secret/smart-task-management-system)
                MONGO_URI=$(vault kv get -field=MONGO_URI secret/smart-task-management-system)
                AUTH_SERVICE_URL=$(vault kv get -field=AUTH_SERVICE_URL secret/smart-task-management-system)
                TASK_SERVICE_URL=$(vault kv get -field=TASK_SERVICE_URL secret/smart-task-management-system)
                NOTIFICATION_SERVICE_URL=$(vault kv get -field=NOTIFICATION_SERVICE_URL secret/smart-task-management-system)
                REPORT_SERVICE_URL=$(vault kv get -field=REPORT_SERVICE_URL secret/smart-task-management-system)

                echo "$HARBOR_PASSWORD" | docker login $HARBOR_URL \
                    -u "$HARBOR_USER" \
                    --password-stdin

                cat > .env <<EOF
JWT_SECRET=$JWT_SECRET
MONGO_URI=$MONGO_URI
AUTH_SERVICE_URL=$AUTH_SERVICE_URL
TASK_SERVICE_URL=$TASK_SERVICE_URL
NOTIFICATION_SERVICE_URL=$NOTIFICATION_SERVICE_URL
REPORT_SERVICE_URL=$REPORT_SERVICE_URL
EOF
                '''
            }
        }

        stage('Create Kubernetes Secret') {
            environment {
                VAULT_TOKEN = credentials('vault-token-smart')
                VAULT_ADDR = "http://13.48.106.244:8200"
            }

            steps {
                sh '''
                export VAULT_ADDR=$VAULT_ADDR
                export VAULT_TOKEN=$VAULT_TOKEN

                JWT_SECRET=$(vault kv get -field=JWT_SECRET secret/smart-task-management-system)
                MONGO_URI=$(vault kv get -field=MONGO_URI secret/smart-task-management-system)
                AUTH_SERVICE_URL=$(vault kv get -field=AUTH_SERVICE_URL secret/smart-task-management-system)
                TASK_SERVICE_URL=$(vault kv get -field=TASK_SERVICE_URL secret/smart-task-management-system)
                NOTIFICATION_SERVICE_URL=$(vault kv get -field=NOTIFICATION_SERVICE_URL secret/smart-task-management-system)
                REPORT_SERVICE_URL=$(vault kv get -field=REPORT_SERVICE_URL secret/smart-task-management-system)

                kubectl create secret generic smart-task-secret \
                    --namespace smart-task \
                    --from-literal=JWT_SECRET="$JWT_SECRET" \
                    --from-literal=MONGO_URI="$MONGO_URI" \
                    --from-literal=AUTH_SERVICE_URL="$AUTH_SERVICE_URL" \
                    --from-literal=TASK_SERVICE_URL="$TASK_SERVICE_URL" \
                    --from-literal=NOTIFICATION_SERVICE_URL="$NOTIFICATION_SERVICE_URL" \
                    --from-literal=REPORT_SERVICE_URL="$REPORT_SERVICE_URL" \
                    --dry-run=client -o yaml | kubectl apply -f -
                '''
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh """
                docker tag ${AUTH_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/auth-service:${IMAGE_TAG}
                docker tag ${TASK_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/task-service:${IMAGE_TAG}
                docker tag ${NOTIFICATION_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/notification-service:${IMAGE_TAG}
                docker tag ${REPORT_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/report-service:${IMAGE_TAG}
                docker tag ${API_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/api-gateway:${IMAGE_TAG}
                docker tag ${FRONTEND_IMAGE}:latest $HARBOR_URL/$HARBOR_PROJECT/frontend:${IMAGE_TAG}
                """
            }
        }

        stage('Push Images to Harbor') {
            steps {
                sh """
                docker push $HARBOR_URL/$HARBOR_PROJECT/auth-service:${IMAGE_TAG}
                docker push $HARBOR_URL/$HARBOR_PROJECT/task-service:${IMAGE_TAG}
                docker push $HARBOR_URL/$HARBOR_PROJECT/notification-service:${IMAGE_TAG}
                docker push $HARBOR_URL/$HARBOR_PROJECT/report-service:${IMAGE_TAG}
                docker push $HARBOR_URL/$HARBOR_PROJECT/api-gateway:${IMAGE_TAG}
                docker push $HARBOR_URL/$HARBOR_PROJECT/frontend:${IMAGE_TAG}
                """
            }
        }

        stage('Helm Lint') {
            steps {
                sh '''
                helm lint helm/frontend
                helm lint helm/api-gateway
                helm lint helm/auth-service
                helm lint helm/task-service
                helm lint helm/notification-service
                helm lint helm/report-service
                '''
            }
        }

        stage('Helm Package') {
            steps {
                sh '''
                mkdir -p helm-packages

                helm package helm/frontend -d helm-packages
                helm package helm/api-gateway -d helm-packages
                helm package helm/auth-service -d helm-packages
                helm package helm/task-service -d helm-packages
                helm package helm/notification-service -d helm-packages
                helm package helm/report-service -d helm-packages
                '''
            }
        }

        stage('Deploy to Kubernetes using Helm') {
            steps {
                sh '''
                helm upgrade --install frontend helm/frontend \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG}

                helm upgrade --install api-gateway helm/api-gateway \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG} \
                    --set env.JWT_SECRET="${JWT_SECRET}" \
                    --set env.MONGO_URI="${MONGO_URI}" \
                    --set env.AUTH_SERVICE_URL="${AUTH_SERVICE_URL}" \
                    --set env.TASK_SERVICE_URL="${TASK_SERVICE_URL}" \
                    --set env.NOTIFICATION_SERVICE_URL="${NOTIFICATION_SERVICE_URL}" \
                    --set env.REPORT_SERVICE_URL="${REPORT_SERVICE_URL}"

                helm upgrade --install auth-service helm/auth-service \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG}

                helm upgrade --install task-service helm/task-service \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG}

                helm upgrade --install notification-service helm/notification-service \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG}

                helm upgrade --install report-service helm/report-service \
                    -n smart-task \
                    --create-namespace \
                    --set image.tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Verify Kubernetes Deployment') {
            steps {
                sh '''
                kubectl get nodes
                kubectl get deployments -n smart-task
                kubectl get pods -n smart-task
                kubectl get svc -n smart-task
                kubectl get ingress -n smart-task
                helm list -n smart-task

                kubectl rollout status deployment/frontend-frontend -n smart-task
                kubectl rollout status deployment/api-gateway-api-gateway -n smart-task
                kubectl rollout status deployment/auth-service-auth-service -n smart-task
                kubectl rollout status deployment/task-service-task-service -n smart-task
                kubectl rollout status deployment/notification-service-notification-service -n smart-task
                kubectl rollout status deployment/report-service-report-service -n smart-task
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f .env || true'
            cleanWs()
            echo 'Pipeline Finished'
        }
        success {
            echo 'CI/CD Pipeline Executed Successfully'
        }
        failure {
            echo 'CI/CD Pipeline Failed'
        }
    }
}
