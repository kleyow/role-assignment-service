/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the 'License') and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files
 are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Kevin Leyow <kevin.leyow@modusbox.com>

 --------------
 ******/

import btoa from 'btoa'
import { StateResponseToolkit } from '~/server/plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'
import axios from 'axios'
import https from 'https'
import Config from '~/shared/config'

interface Wso2IsUser {
  name: {
    givenName: string | undefined;
    familyName: string | undefined;
  };
  id: string;
  userName: string | undefined;
  emails: string[] | undefined;
}

const get = async (_context: unknown, request: Request, h: StateResponseToolkit): Promise<ResponseObject> => {
  try {
    const userId: string = request.params.ID
    const basicAuth = 'Basic ' + btoa(`${Config.WSO2_USER}:${Config.WSO2_PASSWORD}`)
    const response = await axios.get(`${Config.WSO2IS_USER_LIST_URL}/${userId}`, {
      headers: { Authorization: basicAuth },
      // WARNING!!!: this bypasses ssl certification. proceeding just for
      //             development purposes
      // TODO: figure out wso2 ssl setup
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
    const data = response.data as Wso2IsUser
    const user = {
      id: data.id,
      name: data.name,
      username: data.userName,
      emails: data.emails
    }
    return h.response({ user: user }).code(200)
  } catch (e) {
    h.getLogger().error(e)
    // TODO: add error information
    return h.response().code(500)
  }
}

export default {
  get
}
