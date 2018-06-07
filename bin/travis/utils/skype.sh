#!/usr/bin/env bash
# coding=utf-8

########################################################################################################################
#
# Skype script
#
########################################################################################################################

# config
repo="AnyChart"
prefix="[Component] #${TRAVIS_BUILD_NUMBER}"
skype_chat_simple=$SKYPE_ROOM

skype_id=$SKYPE_ID
skype_key=$SKYPE_KEY
skype_chat_release=$SKYPE_ROOM_RELEASE

skype_url_token="https://login.microsoftonline.com/common/oauth2/v2.0/token"
skype_url_simple="https://apis.skype.com/v2/conversations/$skype_chat_simple/activities"
skype_url_release="https://apis.skype.com/v2/conversations/$skype_chat_release/activities"
skype_scope="https://api.botframework.com/.default"

msg=""

# functions
function current_branch(){
    echo $(git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')
}

function commit_url(){
    echo "https://github.com/AnyChart/$repo/commit/"$(commit_hash)
}

function commit_hash(){
    echo $(git rev-parse --short HEAD)
}

function commit_msg(){
    echo $(git log -1 --pretty=%B)
}

function commit_author(){
    echo "@"$(git log -1 --pretty=%an)
}

function commit_date(){
    echo $(git log -1 --pretty=%ci)
}

function is_release(){
    if [[ "$(current_branch)" =~ "master" ]]; then return 1; fi
    if [[ "$(current_branch)" =~ ^([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then return 1; fi
    if [[ "$(current_branch)" =~ ^([0-9]+\.[0-9]+\.[0-9]+[-rc]+[0-9]+)$ ]]; then return 1; fi
    return 0;
}

token=""
function skype_token(){
    if [ "$token" ] ; then return 1; fi

    {
    #try
        #response=$(curl -i -o output.txt -X POST $skype_url_token \
        response=$(curl  --silent -X POST ${skype_url_token} \
            -F 'client_id='${skype_id} \
            -F 'scope='${skype_scope} \
            -F 'grant_type=client_credentials' \
            -F 'client_secret='${skype_key})

        token=$(echo ${response} | sed "s/{.*\"access_token\":\"\([^\"]*\).*}/\1/g")
    } || {
    #catch
        exit 1
    }
}


function skype_curl(){
    echo curl -H "'Content-Type:application/json'" -H "'Authorization: Bearer $token'" -X POST -d  "'$data'" "'$1'" > output.txt
    # cat output.txt
    # that's kind of magic
    bash output.txt
    cat output.txt && rm output.txt
}


function skype_send(){

    if [ ${#msg} -eq 0 ]; then skype_message "$@" ; fi

    if [ ${#msg} -eq 0 ]; then echo "No msg found";return 0; fi

    skype_token
    data='{"message": {"content": "'${msg}'"}}'
    if [ "$token" ]; then
        { #try            
            if [[ $(is_release) -eq 1 ]]; then 
                echo $(skype_curl ${skype_url_release}); 
            else 
                if [[ "$TRAVIS_BRANCH" =~ "develop" ]]; then
                    echo $(skype_curl ${skype_url_simple})
                fi
            fi
        } || { #catch
            exit 1
        }
    fi
    msg=""
}

function get_color(){
    case $1 in
        red) echo "#7c0000" ;;
        green) echo "#007c00" ;;
        blue) echo "#00007c" ;;
        grey) echo "#7c7c7c" ;;
        *) echo $1 ;;
    esac
}

# colorize message
function clrz(){
    echo "<b><font color=\\\"$(get_color $1)\\\">$2</font></b>"
}

function see_report(){
    echo "(<a href=\\\"https://travis-ci.org/AnyChart/$repo/builds/${TRAVIS_BUILD_ID}\\\">see report</a>)"
}

function get_msg(){
    echo "${prefix} <b>${TRAVIS_BRANCH}</b> \\\"$(commit_msg)\\\" $(commit_author) ($(commit_hash)) \n"
}

function skype_message(){
    case $1 in
        "status")
            msg="$(get_msg) $(clrz grey "$2")" ;;
        "start")
            msg="$(get_msg) $(clrz blue "start travis") $(see_report)" ;;
        "success")
            msg="$(get_msg) $(clrz green "travis successed") $(see_report)" ;;
        "failed")
            msg="$(get_msg) $(clrz red "travis failed") $(see_report)" ;;
        *)
            msg=$1
    esac

}

#skype_send success