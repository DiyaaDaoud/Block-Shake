// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract NotificationsHelper {
    mapping(address => uint256) private seenNotifications;

    function setSeenNotifications(address _user, uint256 _notifications)
        public
    {
        seenNotifications[_user] = _notifications;
    }

    function getSeenNotifications(address _user) public view returns (uint256) {
        return seenNotifications[_user];
    }
}
