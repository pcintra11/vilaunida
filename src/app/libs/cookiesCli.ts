import { addSeconds } from 'date-fns';
import Cookies from 'js-cookie';
import {
  add as add_dtfns,
} from 'date-fns'; //@!!!!!!!!!!12 usar dayjs, pois date-fns não funfa com Datepicker (mui x)

const maxDaysForCookieExpires = 400;
const expiresCookiesMax = add_dtfns(new Date(), { days: maxDaysForCookieExpires });

export interface ICookieOptions {
  maxAgeSeconds?: number | 'max'; //  Default: session (deleta ao fechar o browser). 'max' => 400 dias
  path?: string;
}

function getAll() {
  return Cookies.get();
}

function get(name: string) {  // não recupera os que foram setados no server !
  //AssertIsClient('cookieCli get', { name });
  return Cookies.get(name);
}
function getJSON(name: string) {
  const valueJSON = get(name);
  let result: any = undefined;
  if (valueJSON != null) {
    try {
      result = JSON.parse(valueJSON);
    } catch (error: any) {
      //csl('tem erro', strObj);
      // a função Cookies.getJSON nessa situação devolve o string !
    }
  }
  return result;
}

/**
 * @param options : { maxAge : 'max' | seconds }
 * maxAge=undefined (default) => sessionCookie
 */
function set(name: string, value: string | undefined, options?: ICookieOptions) {
  //AssertIsClient('cookieCli set', { name, value });
  if (value == null) {
    //dbgError('cookieCli', name, 'set para null');
    remove(name);
    return;
  }
  const optionsUse: any = {};
  if (options?.maxAgeSeconds === 'max') optionsUse.expires = expiresCookiesMax;
  else if (options?.maxAgeSeconds != null) optionsUse.expires = addSeconds(new Date(), options?.maxAgeSeconds);
  //if (options?.path != null) options.path;
  return Cookies.set(name, value, optionsUse);
}
function setJSON(name: string, value: object, options?: ICookieOptions) {
  return set(name, JSON.stringify(value), options);
}

function remove(name: string) {
  return Cookies.remove(name);
}

export const CookieCli = {
  getAll,
  get,
  getJSON,
  set,
  setJSON,
  remove,
};