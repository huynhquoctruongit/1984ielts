import { XMarkIcon } from "@heroicons/react/24/outline";

const PrivacyPolicy = () => {

    return (
        <div className="">
            <div className="fixed mx-[330px] my-[40px] top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto bg-white border border-gray-300 shadow-lg rounded-md">

                <div className="title-modal flex items-center px-[25px] py-[15px]">
                    <div>Privacy Policy </div>
                    <XMarkIcon className="w-4 h-4 ml-auto" />
                </div>

                <div className="line w-[full] h-0.5 bg-black" />

                <div className="modal-content px-[25px] py-[15px]">
                    <div> Who we are </div>
                    <span> Suggested text: </span> <span> Our website address is: https://ieltsgorilla.in.</span>
                    <div> Comments </div>
                    <span> Suggested text: </span> <span> When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection. </span>
                    <div> An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.</div>
                    <div> Media </div>
                    <div> <b> Suggested text: </b> If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website. </div>
                    <div> Cookies </div>
                    <div> Suggested text: If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</div>
                    <div> If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</div>
                    <div> When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed. </div>
                    <div> If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day. </div>
                    <div> Embedded content from other websites</div>
                    <div> Suggested text: Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</div>
                    <div> These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website. </div>
                    <div> Who we share your data with</div>
                    <div> Suggested text: If you request a password reset, your IP address will be included in the reset email.</div>
                    <div> How long we retain your data </div>
                    <div> Suggested text: If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.</div>
                    <div> For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.</div>
                    <div> What rights you have over your data </div>
                    <div> Suggested text: If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</div>
                    <div> Where your data is sent</div>
                    <div> <b>Suggested text:</b> Visitor comments may be checked through an automated spam detection service.</div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy;