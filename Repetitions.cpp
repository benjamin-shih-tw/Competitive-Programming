#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    string s;
    cin >> s;
    int cnt = 1;
    int mx = 0;
    for(int i = 1 ; i < SZ(s) ; i++){
        if(s[i] == s[i-1]) cnt++;
        else { mx = max(mx,cnt); cnt = 1; }
    }
    mx = max(mx,cnt);
    cout << mx;
}