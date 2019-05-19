def getEnvVar(String paramName){
    return sh (script: "grep '${paramName}' env_vars/project.properties|cut -d'=' -f2", returnStdout: true).trim();
}
def getTargetEnv(String branchName){
    def deploy_env = 'none';
    switch(branchName) {
        case 'master':
            deploy_env='uat'
        break
        case 'develop':
            deploy_env = 'dev'
        default:
            if(branchName.startsWith('release')){
                deploy_env='sit'
            }
            if(branchName.startsWith('feature')){
                deploy_env='none'
            }
    }
    return deploy_env
}

def getImageTag(String currentBranch)
{
    def image_tag = 'latest'
    if(currentBranch==null){
        image_tag = getEnvVar('IMAGE_TAG')
    }
    if(currentBranch=='master'){
        image_tag= getEnvVar('IMAGE_TAG')
    }
    if(currentBranch.startsWith('release')){
        image_tag = currentBranch.substring(8);
    }
    return image_tag
}

def run_playbook(id) {
	sh "ansible-playbook ${id}";
}

pipeline{

environment {
    GIT_COMMIT_SHORT_HASH = sh (script: "git rev-parse --short HEAD", returnStdout: true)
}
options {
      timeout(time: 7, unit: 'MINUTES') 
    }
agent any

stages{
    stage('Init'){
        steps{
            //checkout scm;
        script{
        env.BASE_DIR = pwd()
        env.CURRENT_BRANCH = env.BRANCH_NAME
        env.IMAGE_TAG = getImageTag(env.CURRENT_BRANCH)
        env.APP_NAME= getEnvVar('APP_NAME')
        env.PROJECT_NAME=getEnvVar('PROJECT_NAME')
        env.DOCKER_REGISTRY_URL=getEnvVar('DOCKER_REGISTRY_URL')
        env.RELEASE_TAG = getEnvVar('RELEASE_TAG')
        env.DOCKER_PROJECT_NAMESPACE = getEnvVar('DOCKER_PROJECT_NAMESPACE')
        env.DOCKER_IMAGE_TAG= "${DOCKER_REGISTRY_URL}/${DOCKER_PROJECT_NAMESPACE}/${APP_NAME}:${RELEASE_TAG}"
        env.JENKINS_DOCKER_CREDENTIALS_ID = getEnvVar('JENKINS_DOCKER_CREDENTIALS_ID')        
        env.JENKINS_GCLOUD_CRED_ID = getEnvVar('JENKINS_GCLOUD_CRED_ID')
        env.GCLOUD_PROJECT_ID = getEnvVar('GCLOUD_PROJECT_ID')
        env.GCLOUD_K8S_CLUSTER_NAME = getEnvVar('GCLOUD_K8S_CLUSTER_NAME')
        env.JENKINS_GCLOUD_CRED_LOCATION = getEnvVar('JENKINS_GCLOUD_CRED_LOCATION')

        }

        }
    }

    stage('Cleanup'){
        steps{
            sh '''
            docker rmi $(docker images -f 'dangling=true' -q) || true
            #docker rmi $(docker images | sed 1,2d | awk '{print $3}') || true
            '''
        }

    }
    stage('Build-api'){
        steps{
            withEnv(["APP_NAME=${APP_NAME}", "PROJECT_NAME=${PROJECT_NAME}"]){
                sh '''
                docker build -t ${APP_NAME}-auth:${RELEASE_TAG} --build-arg APP_NAME=${APP_NAME}-auth  -f pyfln-auth/Dockerfile pyfln-auth/.
                docker tag ${APP_NAME}-auth:${RELEASE_TAG} ${DOCKER_REGISTRY_URL}/${DOCKER_PROJECT_NAMESPACE}/${APP_NAME}-auth:${RELEASE_TAG}
                '''
            }   
        }
    }
    stage('Build-ui'){
        steps{
            withEnv(["APP_NAME=${APP_NAME}", "PROJECT_NAME=${PROJECT_NAME}"]){
                sh '''
                docker build -t ${APP_NAME}-ui:${RELEASE_TAG} --build-arg APP_NAME=${APP_NAME}-ui  -f pyfln-ui/Dockerfile pyfln-ui/.
                docker tag ${APP_NAME}-ui:${RELEASE_TAG} ${DOCKER_REGISTRY_URL}/${DOCKER_PROJECT_NAMESPACE}/${APP_NAME}-ui:${RELEASE_TAG}
                '''
            }   
        }
    }
    // stage('Publish'){
    //     steps{
    //         withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: "${JENKINS_DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWD']])
    //         {
    //         sh """
    //         #echo ${DOCKER_PASSWD} | docker login --username ${DOCKER_USERNAME} --password-stdin ${DOCKER_REGISTRY_URL} 
    //         #docker push ${DOCKER_REGISTRY_URL}/${DOCKER_PROJECT_NAMESPACE}/${APP_NAME}_auth:${RELEASE_TAG}
    //         #docker push ${DOCKER_REGISTRY_URL}/${DOCKER_PROJECT_NAMESPACE}/${APP_NAME}_ui:${RELEASE_TAG}
    //         #docker logout
    //         """
    //         }
    //     }
    // }
    stage('Deploy'){
        steps
        {
            sh '''#!/bin/bash -xe
            ansible-playbook -vvv ${BASE_DIR}/runcontainers.yml \
            && ansible-playbook -vvv ${BASE_DIR}/recreate_network.yml
            '''
            // script{
            //     // withCredentials([file(credentialsId: "${JENKINS_GCLOUD_CRED_ID}", variable: 'JENKINSGCLOUDCREDENTIAL')])
            //     // {
            //         run_playbook('runcontainers.yml')
            //         run_playbook('recreate_network.yml')
            //     // }
            // }
        }
    }
}

post {
    always {
        echo "Build# ${env.BUILD_NUMBER} - Job: ${env.JOB_NUMBER} status is: ${currentBuild.currentResult}"
        // emailext(attachLog: true,
        // mimeType: 'text/html',
        // body: '''
        // <h2>Build# ${env.BUILD_NUMBER} - Job: ${env.JOB_NUMBER} status is: ${currentBuild.currentResult}</h2>
        // <p>Check console output at &QUOT;<a href='${env.BUILD_URL'>${env.JOB_NAME} - [${env.BUILD_NUMBER}]</a>&QUOT;</p>
        // ''',
        // recipientProviders: [[$class: "FirstFailingBuildSusspectRecipientProvider"]],
        // subject: "Build# ${env.BUILD_NUMBER} - Job: ${env.JOB_NUMBER} status is: ${currentBuild.currentResult}",
        // to: "e.amitthakur@gmail.com")
    }
}
}