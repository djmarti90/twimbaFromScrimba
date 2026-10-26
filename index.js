import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsDataLocalStorage = JSON.parse(localStorage.getItem('tweetsData'));
let openedTweetMenuId = 0;

if (!tweetsDataLocalStorage) {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if (e.target.dataset.menu) {
        revealTweetMenu(e.target.dataset.menu)
    }
    else if (e.target.dataset.delete) {
        handleTweetDelete(e.target.dataset.delete)
    }
    else if (e.target.dataset.deleteReply) {
        handleReplyDelete(e.target.dataset.deleteReply, e.target.dataset.tweetId)
    }
    else if (e.target.dataset.selfReply) {
        handleSelfReply(e.target.dataset.selfReply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else {
        if (openedTweetMenuId !== 0) {
            const menuButton = document.getElementById(`menu${openedTweetMenuId}`)
            if (menuButton.style.display !== 'none') {
                menuButton.style.display = 'none'
            }
        }
    }
})

function handleSelfReply(tweetId) {

    const selfReplyText = document.getElementById(`selfReplyText${tweetId}`)
    const newTweetsDataLocalStorage = tweetsDataLocalStorage.map((tweet) => {
        if (tweet.uuid === tweetId) {
            tweet.replies.unshift({
                handle: '@Scrimba',
                profilePic: 'images/scrimbalogo.png',
                tweetText: selfReplyText.value,
                uuid: uuidv4(),
            })
        }
        return tweet
    })
    localStorage.setItem('tweetsData', JSON.stringify(newTweetsDataLocalStorage))

    render()
}

function handleTweetDelete(tweetId){
    let confirmation = confirm("Do you really want to delete this tweet?");
    if (confirmation) {
        tweetsDataLocalStorage.splice(tweetId, 1);
        localStorage.setItem('tweetsData', JSON.stringify(tweetsDataLocalStorage))
        openedTweetMenuId = 0
    }
    render()
}

function handleReplyDelete(replyId, tweetId) {
    let confirmation = confirm("Do you really want to delete this tweet?");
    if (confirmation) {
        const targetTweet = tweetsDataLocalStorage.find(tweet => tweet.uuid === tweetId);
        if (targetTweet) {
            const targetReplyIndex = targetTweet.replies.findIndex(reply => reply.uuid === replyId);
            if (targetReplyIndex !== -1) {
                targetTweet.replies.splice(targetReplyIndex, 1);
                localStorage.setItem('tweetsData', JSON.stringify(tweetsDataLocalStorage));
            }
        }
        openedTweetMenuId = 0
    }
    render()
}

function revealTweetMenu(tweetId){
    const menuButton = document.getElementById(`menu${tweetId}`)
    if (menuButton.style.display === 'none' || menuButton.style.display === ''){
        if (openedTweetMenuId !== 0){
            const openedMenuButton = document.getElementById(`menu${openedTweetMenuId}`)
            openedMenuButton.style.display = 'none'
        }

        document.getElementById(`menu${tweetId}`).style.display = 'block'
        openedTweetMenuId = tweetId
    }
    else {
        document.getElementById(`menu${tweetId}`).style.display = 'none'
    }
}
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsDataLocalStorage.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsDataLocalStorage.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsDataLocalStorage.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        localStorage.setItem('tweetsData', JSON.stringify(tweetsDataLocalStorage))
    render()
    tweetInput.value = ''
    }

}

function getFeedHtml(){
    let feedHtml = ``

    tweetsDataLocalStorage.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml += `
<div class="tweet-reply" id="reply${reply.uuid}">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>`

                repliesHtml += reply.handle === '@Scrimba' ? `
                <div style="position: relative;">
                    <div class="menuButton" role="menu" data-menu="${reply.uuid}">...</div>
                    <div class="tweetMenu" id="menu${reply.uuid}" data-delete-reply="${reply.uuid}" data-tweet-id="${tweet.uuid}">Delete</div>
                </div>` : ''

                repliesHtml += ` <p class="tweet-text">${reply.tweetText}</p>
            </div>
    </div>
</div>
`
            })
        }
        
          
        feedHtml += `
<div class="tweet" id="tweet${tweet.uuid}">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <div style="display: flex; position: relative; gap: 5px">
                <p class="handle">${tweet.handle}</p>`

                feedHtml += tweet.handle === '@Scrimba' ? `<div style="position: relative;">
                    <div class="menuButton" role="menu" data-menu="${tweet.uuid}">...</div>
                    <div class="tweetMenu" id="menu${tweet.uuid}" data-delete="${tweet.uuid}">Delete</div>
                </div>` : ''

            feedHtml += `</div>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden replies" id="replies-${tweet.uuid}">
        ${repliesHtml}
        <div class="tweet-input-area"><img src="images/scrimbalogo.png" class="profile-pic"><textarea id="selfReplyText${tweet.uuid}"></textarea></div>
        <button data-self-reply="${tweet.uuid}">Reply</button>
    </div>
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()