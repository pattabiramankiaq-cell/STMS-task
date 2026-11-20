
pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        GIT_URL = 'https://github.com/pattabiramankiaq-cell/STMS-task.git'
        HARBOR_REGISTRY = '172.22.160.254:9443'
        HARBOR_PROJECT = 'smart-task'
        K8S_NAMESPACE = 'stms'
        SONAR_PROJECT_KEY = 'STMS'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'gitcreds',
                    url: "${GIT_URL}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -e
                    for dir in frontend auth-service_1784011000189 task-service notification-service report-service api-gateway_1784010924579; do
                        echo "Installing dependencies: $dir"
                        (cd "$dir" && npm install --no-audit --no-fund)
                    done
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            '${scannerHome}/bin/sonar-scanner' \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName=STMS \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy File System Scan') {
            steps {
                sh '''
                    trivy fs --exit-code 0 \
                      --severity HIGH,CRITICAL \
                      --no-progress .
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e
                    docker build -t stms-frontend:latest ./frontend
                    docker build -t stms-auth:latest ./auth-service_1784011000189
                    docker build -t stms-task:latest ./task-service
                    docker build -t stms-notification:latest ./notification-service
                    docker build -t stms-report:latest ./report-service
                    docker build -t stms-gateway:latest ./api-gateway_1784010924579
                '''
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                sh '''
                    set -e
                    for image in stms-frontend stms-auth stms-task stms-notification stms-report stms-gateway; do
                        trivy image --exit-code 0 \
                          --severity HIGH,CRITICAL \
                          --no-progress "$image:latest"
                    done
                '''
            }
        }

        stage('Fetch Secrets From Vault & Harbor Login') {
            steps {
                withCredentials([
                    string(credentialsId: 'vault-token', variable: 'VAULT_TOKEN')
                ]) {
                    sh '''
                        set +x
                        export VAULT_ADDR="https://127.0.0.1:8200"

                        command -v vault
                        vault token lookup >/dev/null
                    '''
                }

                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-creds',
                        usernameVariable: 'HARBOR_USER',
                        passwordVariable: 'HARBOR_PASS'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$HARBOR_PASS" | docker login \
                          "$HARBOR_REGISTRY" \
                          --username "$HARBOR_USER" \
                          --password-stdin
                    '''
                }
            }
        }

        stage('Create Kubernetes Secret') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-creds',
                        usernameVariable: 'HARBOR_USER',
                        passwordVariable: 'HARBOR_PASS'
                    )
                ]) {
                    sh '''
                        set +x
                        kubectl create namespace "$K8S_NAMESPACE" \
                          --dry-run=client -o yaml | kubectl apply -f -

                        kubectl create secret docker-registry harbor-secret \
                          --docker-server="$HARBOR_REGISTRY" \
                          --docker-username="$HARBOR_USER" \
                          --docker-password="$HARBOR_PASS" \
                          -n "$K8S_NAMESPACE" \
                          --dry-run=client -o yaml | kubectl apply -f -
                    '''
                }
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh '''
                    set -e
                    for image in frontend auth task notification report gateway; do
                        docker tag "stms-$image:latest" \
                          "$HARBOR_REGISTRY/$HARBOR_PROJECT/stms-$image:$BUILD_NUMBER"
                    done
                '''
            }
        }

        stage('Push Images to Harbor') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'harbor-creds',
                        usernameVariable: 'HARBOR_USER',
                        passwordVariable: 'HARBOR_PASS'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$HARBOR_PASS" | docker login \
                          "$HARBOR_REGISTRY" \
                          -u "$HARBOR_USER" --password-stdin

                        set -e
                        for image in frontend auth task notification report gateway; do
                            docker push \
                              "$HARBOR_REGISTRY/$HARBOR_PROJECT/stms-$image:$BUILD_NUMBER"
                        done
                    '''
                }
            }
        }

        stage('Helm Lint') {
            steps {
                sh 'helm lint ./helm/stms'
            }
        }

        stage('Helm Package') {
            steps {
                sh '''
                    mkdir -p helm-packages
                    helm package ./helm/stms -d helm-packages
                '''
            }
        }

        stage('Deploy to Kubernetes using Helm') {
            steps {
                sh '''
                    helm upgrade --install stms ./helm/stms \
                      --namespace "$K8S_NAMESPACE" \
                      --create-namespace \
                      --set image.registry="$HARBOR_REGISTRY" \
                      --set image.project="$HARBOR_PROJECT" \
                      --set image.tag="$BUILD_NUMBER"
                '''
            }
        }

        stage('Verify Kubernetes Deployment') {
            steps {
                sh '''
                    kubectl get pods -n "$K8S_NAMESPACE"
                    kubectl get services -n "$K8S_NAMESPACE"
                    kubectl get deployments -n "$K8S_NAMESPACE"
                    helm status stms -n "$K8S_NAMESPACE"
                '''
            }
        }
    }

    post {
        success {
            echo 'STMS CI/CD Pipeline Completed Successfully'
        }
        failure {
            echo 'STMS CI/CD Pipeline Failed'
        }
        always {
            echo 'Pipeline Finished'
        }
    }
}

