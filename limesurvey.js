var request = require("request");

const lime_user = "admin";
const lime_password = "password";

var SESSIONKEY = "";
var limeAPI = {
  url:
    "http://localhost:80/limesurvey/LimeSurvey/index.php/admin/remotecontrol",
  method: "POST",
  headers: {
    host: "localhost:80",
    path: "/limesurvey/LimeSurvey/index.php/admin/remotecontrol",
    connection: "keep-alive",
    "content-type": "application/json"
  }
};

/**
 * Connect to the LimeSurvey RemoteControl 2 API and save session key in SESSIONKEY. This is required for all LSRC2 function calls.
 *
 * @param {string} username The lime survey (admin) username used to access the API
 * @param {string} password The lime survey (admin) password used to access the API
 * @param {object} APIvar An object containing the url of the LSRC2 API access point, the method type ("i.e POST") and relevant headers.
 * @return {string} The session key
 */
function getSession(username, password, APIvar) {
  /**
   * Attach LSRC method name (get_session_key) and params to the body of APIvar.
   *  */

  APIvar.body = JSON.stringify({
    method: "get_session_key",
    params: [username, password],
    id: 1
  });

  /**
   * Send request to execute LSRC2 method call (get_session_key) and return session key.
   */
  request(APIvar, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);

      if (SESSIONKEY === "") {
        SESSIONKEY = body.result;
        // Could call LSRC2 functions here
        return SESSIONKEY;
      }
    }
  });
}

/**
 * List the surveys created by a given user.
 * @param {string} sessionkey The session key saved in var SESSIONKEY after calling getSession()
 * @param {string} username The lime survey username who's surveys you wish to return
 * @param {object} APIVar An object containing the url of the LSRC2 API access point, the method type ("i.e POST") and relevant headers.
 * @return {Object[]} An array of objects as follows:
 * <p>{ sid: '834781',
    surveyls_title: 'IT Score',
    startdate: null,
    expires: null,
    active: 'Y' }</p>
    <ul>  
        <li>(sid) represents the survey ID</li> 
        <li>(surveyls_title) represents the title/name of the survey</li> 
        <li>(startdate) represents the date the survey starts</li> 
        <li>(expires) indicates if and when the survey will expire</li> 
        <li>(active) represents if the survey is currently active.</li> 
    </ul>
 */
function listSurveys(sessionkey, username, APIVar) {
  limeAPI.body = JSON.stringify({
    method: "list_surveys",
    params: [sessionkey, username],
    id: 1
  });

  request(APIVar, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      let surveys = body.result;
      return surveys;
    } else console.log("ERROR -->" + error);
  });
}

/**
 * List the questions and their details given a survey ID.
 * @param {string} sessionkey The session key saved in var SESSIONKEY after calling getSession()
 * @param {number} surveyId The survey ID of the survey that you wish to extract the questions and details from.
 * @param {object} APIVar An object containing the url of the LSRC2 API access point, the method type ("i.e POST") and relevant headers.
 * @return {Object[]} An array of objects as follows:
 * <p>id: (Object),
       qid: '249',
       parent_qid: '171',
       sid: '243417',
       type: 'T',
       title: 'SQ012',
       question: 'Risk manager',
       preg: null,
       help: '',
       other: 'N',
       mandatory: null,
       question_order: '12',
       language: 'en',
       scale_id: '0',
       same_default: '0',
       relevance: '1',
       modulename: '',
       gid: '3' }</p>
    <ul>  
        <li>(qid) The lime survey question ID</li> 
        <li>(parent_qid) represents the question ID of the parent, particularly if the question is a sub question of a main question</li> 
        <li>(sid) represents the survey ID</li> 
        <li>(type) indicates the type of the lime survey (i.e array, multiple choice, single choice with rows). For some reason all of the question types are represented with T which is a long text question</li> 
        <li>(title) represents the "title" of the question. In this case SQ012 is a subquestion number 12. This does not need to be displayed</li> 
        <li>(question) This is the actual question text which should be displayed</li> 
        <li>(help) Indicates if there is any hint text provided with the question</li> 
        <li>(other) indicates if there is an input option for "other" if the user's option is not present (i.e other: _____ )</li> 
        <li>(question_order) represents the order of the question, particularly if it is a subquestion of a parent question</li>
        <li>(language) indicates the language the question is presented in</li> 
        <li>(gid) indicates the group ID of the question (i.e Risk Management questions are part of group 2, Finance questions are part of question group 3)</li>  
    </ul>
 */
function listQuestions(sessionkey, surveyId, APIVar) {
  APIVar.body = JSON.stringify({
    method: "list_questions",
    params: [sessionkey, surveyId],
    id: 1
  });

  request(APIVar, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      return body;
    } else console.log("ERROR -->" + error);
  });
}

/**
 * Saves responses as a row in the survey table. (i.e for survey id: 243417, the table will be called lime_survey_243417).
 * @param {string} sessionkey The session key saved in var SESSIONKEY after calling getSession()
 * @param {number} surveyId The survey ID of the survey that you wish to save the responses of.
 * @param {object} responseObj This is an object having entries of a key value pair in the format example: 
 * <p><strong>const fakeResponse = {
        "243417X3X170": "A1",
        "243417X3X171SQ001": "A1",
        "243417X3X171SQ002": "A1"
      };</strong></p> The key will have to be generated in the format (sid)X(gid)X(parent_qid)(title, if the question is a subquestion).
 * @param {object} APIVar An object containing the url of the LSRC2 API access point, the method type ("i.e POST") and relevant headers.
 */
function saveResponse(sessionkey, surveyId, responseObj, APIVar) {
  limeAPI.body = JSON.stringify({
    method: "add_response",
    params: [sessionkey, surveyId, responseObj],
    id: 1
  });

  request(APIVar, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
    } else console.log("ERROR -->" + error + response + body);
  });
}
