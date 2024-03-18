pipeline {
    agent any
    environment {

    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install and Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build('route-planner:${BUILD_NUMBER}')
                }
            }
        }
        stage('Deploy') {
            steps {
                echo "done"
            }
        }
    }
    post {

    }
}