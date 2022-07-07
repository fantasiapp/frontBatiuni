export const lowerCase = /[a-z]/;
export const upperCase = /[A-Z]/;
export const number = /[0-9]/;
export const symbols = /\+|\-|\*|\_|\,|\;|\./;
export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const phone = /^(\+\d{1,3}|0|00\d{2})?[1-9]\d{8}$/;
export const url = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[\w_-]+(\.\w+)+((\/)[\w#]+)*(\/\w+\?[\w_]+=[\w\+\._-]+(&[\w_]+=[\w\+\._-]+)*)?(\/)?$/;