// Jenkins pipeline for the ParaBank UI + Automation Exercise API framework.
//
// Needs on the Jenkins server:
//   - Docker on the agent + the "Docker Pipeline" plugin (tests run in Playwright's official image)
//   - Credentials (Manage Jenkins > Credentials), kind "Username with password":
//       parabank-user      → PARABANK_USERNAME / PARABANK_PASSWORD
//     and kind "Secret text":
//       parabank-register-password → PARABANK_REGISTER_PASSWORD
//   - Optional: "HTML Publisher" plugin (Playwright report tab) and "Allure" plugin (Allure tab)
//
// Same image tag as GitHub Actions: keep it in sync with @playwright/test in package.json.

pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.65.0-noble'
      args '--ipc=host'
    }
  }

  parameters {
    choice(name: 'TEST_ENV', choices: ['qa', 'staging', 'prod'], description: 'ParaBank environment to test')
    choice(name: 'SUITE', choices: ['smoke', 'all', 'ui', 'api', 'api-safe'],
           description: 'smoke = critical tests (@smoke) · all = full regression · ui = ParaBank UI · api = Automation Exercise API · api-safe = API without account tests')
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
  }

  environment {
    CI = 'true'
    HOME = "${env.WORKSPACE}"          // npm cache inside the workspace (the container user has no home)
    TEST_ENV = "${params.TEST_ENV}"
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci --no-audit --no-fund'
      }
    }

    stage('Type check') {
      steps {
        sh 'npx tsc --noEmit -p .'
      }
    }

    stage('Test') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'parabank-user', usernameVariable: 'PARABANK_USERNAME', passwordVariable: 'PARABANK_PASSWORD'),
          string(credentialsId: 'parabank-register-password', variable: 'PARABANK_REGISTER_PASSWORD'),
        ]) {
          script {
            def command = [
              'smoke'   : 'npx playwright test --grep @smoke',
              'all'     : 'npx playwright test',
              'ui'      : 'npx playwright test tests/ui',
              'api'     : 'npx playwright test --project=api',
              'api-safe': 'npx playwright test --project=api --grep-invert @auth',
            ][params.SUITE]
            sh command
          }
        }
      }
    }
  }

  post {
    always {
      // Built-in JUnit step: pass/fail counts, trends and per-test history on the job page.
      junit testResults: 'junit-results/results.xml', allowEmptyResults: true
      archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
      // Comment out a block if its plugin isn't installed.
      publishHTML(target: [
        reportName : 'Playwright Report',
        reportDir  : 'playwright-report',
        reportFiles: 'index.html',
        keepAll    : true,
        alwaysLinkToLastBuild: true,
        allowMissing: true,
      ])
      allure(results: [[path: 'allure-results']])
    }
  }
}
