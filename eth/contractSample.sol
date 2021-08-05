pragma solidity >=0.4.22 <0.8.0;

contract Test {

    uint256 index;

    function set_data (uint256 v) public returns(bool) {
        index += v;
        return true;
    }

    function get_data () public view returns (uint256) {
        return index;
    }

}